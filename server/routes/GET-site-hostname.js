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
  var reductionStart;
  var totalHits = 0;
  var queryTags = req.query.tags && req.query.tags.split(',') || [];
  var tags;

  return db.tags.calculate({
    filter: { hostname: req.dbQuery.hostname },
    'tags-total-hits': {
      tags: queryTags
    },
    'tags-names': {}
  }).then(function (tagsResults) {
    tags = tagsResults['tags-names'];

    if (queryTags.length) {
      totalHits = tagsResults['tags-total-hits'];
    } else {
      return db.site.calculate({
        filter: { hostname: req.dbQuery.hostname },
        'sites-total-hits': {}
      }).then(function (sites) {
        totalHits = sites[req.dbQuery.hostname] || 0;
      });
    }
  })
  .then(function() {
    reductionStart = new Date();

    return db.pageView.calculate({
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
    });
  })
  .then(function (results) {
    var reductionEnd = new Date();
    var reductionDuration = reductionEnd.getTime() - reductionStart.getTime();
    logger.info('reduction time for %s: %s ms', req.url, reductionDuration);

    var data = {
      root_url: req.url.replace(/\?.*/, ''),
      hostname: req.params.hostname,
      pageHitsPerPage: results.hits_per_page,
      pageHitsPerDay: results.hits_per_day.__all,
      referrers: results.referrers.by_count.slice(0, 20),
      startDate: req.start.format('MMM DD'),
      endDate: req.end.format('MMM DD'),
      hits: {
        total: totalHits,
        period: results.hits_per_page[0].hits,
        today: results.hits_per_day.__all[results.hits_per_day.__all.length - 1].hits,
        unique: results.unique,
        repeat: results.returning
      },
      tags: tags
    };

    tags = null;

    return data;

  });
};

