/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Promise = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname';
exports.verb = 'get';
exports.template = 'GET-site-hostname.html';
exports['js-resources'] = clientResources('rum-diary.min.js');

exports.handler = function(req) {
  var reductionStart;
  var totalHits = 0;
  var queryTags = req.query.tags && req.query.tags.split(',') || 0;
  var tags;

  var reduceStream = new reduce.StreamReduce({
    which: [
      'hits_per_day',
      'hits_per_page',
      'referrers',
      'unique',
      'returning'
    ],
    start: req.start,
    end: req.end,
    'hits_per_day': {
      start: req.start,
      end: req.end
    }
  });

  return db.tags.get({
      hostname: req.dbQuery.hostname
    })
    // XXX move this into a reduce stream.
    .then(function (_tags) {
      tags = _tags.map(function(tag) { return tag.name; });

      // tags are specified as a filter, count the
      // total hits for the matching tags.
      // This does not work for the "not" tag.
      if (queryTags.length) {
        totalHits = _tags.reduce(function(totalHits, tag) {
          if (queryTags.indexOf(tag.name) > -1) totalHits += tag.total_hits;
          return totalHits;
        }, 0);
      }
    })
    .then(function () {
      // only use the grand total number of hits if a set of tags is not
      // specified as a filter.
      if (! queryTags.length) {
        return db.site.getOne({
          hostname: req.dbQuery.hostname
        })
        .then(function(site) {
          if (site) totalHits = site.total_hits;
        });
      }
    })
    .then(function() {
      // Use a stream instead of one large get for memory efficiency.
      reductionStart = new Date();
      return db.pageView.pipe(req.dbQuery, null, reduceStream);
    })
    .then(function (results) {
      var pageHitsPerPageSorted = sortPageHitsPerPage(results.hits_per_page).slice(0, 20);

      var reductionEnd = new Date();
      var reductionDuration = reductionEnd.getTime() - reductionStart.getTime();
      logger.info('reduction time for %s: %s ms', req.url, reductionDuration);

      tags = null;
      reduceStream.end();
      reduceStream = null;
      return {
        root_url: req.url.replace(/\?.*/, ''),
        hostname: req.params.hostname,
        resources: clientResources('rum-diary.min.js'),
        pageHitsPerPage: pageHitsPerPageSorted,
        pageHitsPerDay: results.hits_per_day.__all,
        referrers: results.referrers.by_count.slice(0, 20),
        startDate: req.start.format('MMM DD'),
        endDate: req.end.format('MMM DD'),
        hits: {
          total: totalHits,
          period: pageHitsPerPageSorted[0].hits,
          today: results.hits_per_day.__all[results.hits_per_day.__all.length - 1].hits,
          unique: results.unique,
          repeat: results.returning
        },
        tags: tags
      };
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
