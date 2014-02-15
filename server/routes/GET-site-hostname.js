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
  var start = moment(query.createdAt.$gte);
  var end = moment(query.createdAt.$lte);
  var reductionStart;
  var totalHits = 0;
  var tags;

  db.site.getOne({
    hostname: query.hostname
  })
  .then(function(site) {
    if (site) totalHits = site.total_hits;
  })
  .then(function() {
    return db.tags.get({
             hostname: query.hostname
           });
  })
  .then(function (_tags) {
    tags = _tags.map(function(tag) { return tag.name });
  })
  .then(function() {
    return db.pageView.get(query);
  }).then(function(hits) {
      reductionStart = new Date();

      return reduce.mapReduce(hits, [
        'hits_per_day',
        'hits_per_page',
        'referrers',
        'unique',
        'returning'
      ], {
        start: start,
        end: end
      });
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
        referrers: data.referrers.by_count.slice(0, 20),
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        hits: {
          total: totalHits,
          period: pageHitsPerPageSorted[0].hits,
          today: data.hits_per_day.__all[data.hits_per_day.__all.length - 1].hits,
          unique: data.unique,
          repeat: data.returning
        },
        tags: tags
      });
    }).catch(function(err) {
      logger.error(String(err));
      res.send(500);
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
