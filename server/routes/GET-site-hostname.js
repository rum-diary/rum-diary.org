/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname';
exports.verb = 'get';
exports.template = 'GET-site-hostname.html';
exports['js-resources'] = clientResources('rum-diary.min.js');

exports.handler = function(req) {
  var queryTags = req.query.tags && req.query.tags.split(',') || [];

  var start = new Date();

  return Promise.all([
     db.tags.calculate({
      filter: { hostname: req.dbQuery.hostname },
      'tags-total-hits': {
        tags: queryTags
      },
      'tags-names': {}
    }),
    db.pageView.calculate({
      filter: req.dbQuery,
      'hits_per_day': {
        start: req.start,
        end: req.end
      },
      'hits_per_page': {
        sort: 'desc',
        limit: 20
      },
      'referrers': {},
      'unique': {},
      'returning': {}
    }),
    db.site.calculate({
      filter: { hostname: req.dbQuery.hostname },
      'sites-total-hits': {}
    })
  ]).then(function (allResults) {
    var end = new Date();
    var duration = end.getTime() - start.getTime();
    logger.info('%s: elapsed time: %s ms', req.url, duration);

    var tagResults = allResults[0];
    var pageViewResults = allResults[1];
    var siteResults = allResults[2];

    var totalHits = 0;
    if (queryTags.length) {
      totalHits = tagResults['tags-total-hits'];
    } else {
      totalHits = siteResults['sites-total-hits'][req.dbQuery.hostname] || 0;
    }

    return {
      root_url: req.url.replace(/\?.*/, ''),
      hostname: req.params.hostname,
      pageHitsPerPage: pageViewResults.hits_per_page,
      pageHitsPerDay: pageViewResults.hits_per_day.__all,
      referrers: pageViewResults.referrers.by_count.slice(0, 20),
      startDate: req.start.format('MMM DD'),
      endDate: req.end.format('MMM DD'),
      hits: {
        total: totalHits,
        period: pageViewResults.hits_per_page[0].hits,
        today: pageViewResults.hits_per_day.__all[pageViewResults.hits_per_day.__all.length - 1].hits,
        unique: pageViewResults.unique,
        repeat: pageViewResults.returning
      },
      tags: tagResults['tags-names']
    };
  });
};

