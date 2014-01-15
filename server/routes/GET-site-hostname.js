/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const logger = require('../lib/logger');
const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');

exports.path = '/site/:hostname';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.updatedAt['$gte']);
  var end = moment(query.updatedAt['$lte']);

  db.get(query, function(err, hits) {
    if (err) return res.send(500);

    var reductionStart = new Date();

    reduce.mapReduce(hits, [
      'hits_per_day',
      'hits_per_page',
      'referrers',
      'navigation'
    ], {
      start: start,
      end: end,
      navigation: {
        calculate: ['25', '50', '75']
      }
    }).then(function(data) {
      var pageHitsPerPageSorted = sortPageHitsPerPage(data.hits_per_page).slice(0, 20);

      var reductionEnd = new Date();
      var reductionDuration = reductionEnd.getTime() - reductionStart.getTime();
      logger.info('reduction time for %s: %s ms', req.url, reductionDuration);

      res.render('GET-site-hostname.html', {
        root_url: req.url.replace(/\?.*/, ''),
        hostname: req.params.hostname,
        resources: clientResources('rum-diary.min.js'),
        pageHitsPerPage: pageHitsPerPageSorted,
        pageHitsPerDay: data.hits_per_day.__all,
        first_q: data.navigation['25'],
        second_q: data.navigation['50'],
        third_q: data.navigation['75'],
        referrers: data.referrers.by_count.slice(0, 20),
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD')
      });
    }).catch(function(err) {
      logger.error(String(err));
      res.send(500);
    });
  });

};

function sortPageHitsPerPage(pageHitsPerPage) {
  var sorted = Object.keys(pageHitsPerPage).map(function(key) {
    return {
      page: key,
      hits: pageHitsPerPage[key]
    };
  }).sort(function(a, b) {
    return b.hits - a.hits;
  });

  return sorted;
}
