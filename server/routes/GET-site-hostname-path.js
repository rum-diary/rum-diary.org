/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const db = require('../lib/db');
const logger = require('../lib/logger');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');


exports.path = /\/site\/([\w\d][\w\d-]*(?:\.[\w\d][\w\d-]*)?)\/path\/([\w\d-]+(?:\/[\w\d-]+)*\/?)$/;
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.createdAt['$gte']);
  var end = moment(query.createdAt['$lte']);

  var hostname = req.params[0];
  var path = req.params[1] || 'index';
  logger.info('get information for %s/%s', hostname, path);

  if ( ! /^\//.test(path)) {
    path = "/" + path;
  }

  query.hostname = hostname;
  query.path = path;

  db.pageView.get(query, function(err, hits) {
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
        calculate: ['median']
      }
    }, function(err, data) {
      var pageHitsPerPageSorted = sortPageHitsPerPage(data.hits_per_page).slice(0, 20);

      var reductionEnd = new Date();
      var reductionDuration = reductionEnd.getTime() - reductionStart.getTime();
      logger.info('reduction time for %s: %s ms', req.url, reductionDuration);

      res.render('GET-site-hostname-path.html', {
        root_url: req.url.replace(/\?.*/, ''),
        path: path,
        hostname: req.params.hostname,
        resources: clientResources('rum-diary.min.js'),
        pageHitsPerPage: pageHitsPerPageSorted,
        pageHitsPerDay: data.hits_per_day.__all,
        median: data.navigation.median,
        referrers: data.referrers.by_count.slice(0, 20),
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD')
      });
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
