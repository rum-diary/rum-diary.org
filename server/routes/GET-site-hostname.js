/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const siteCollection = db.site;
const calculator = require('../lib/calculator');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname';
exports.verb = 'get';
exports.template = 'GET-site-hostname.html';
exports['js-resources'] = clientResources('rum-diary.min.js');
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {

  var queryTags = req.query.tags && req.query.tags.split(',') || [];

  return Promise.all([
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.dbQuery.hostname),
    calculator.calculate({
      tags: {
        filter: { hostname: req.dbQuery.hostname },
        'tags-total-hits': {
          tags: queryTags
        },
        'tags-names': {}
      },
      pageView: {
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
      },
      site: {
        filter: { hostname: req.dbQuery.hostname },
        'sites-total-hits': {}
      }
    })
  ]).then(function (allResults) {
    var isAdmin = allResults[0];
    var calculatorResults = allResults[1];

    logger.info('%s: elapsed time: %s ms', req.url, calculatorResults.duration);

    var tagResults = calculatorResults.tags;
    var pageViewResults = calculatorResults.pageView;
    var siteResults = calculatorResults.site;

    var totalHits = 0;
    if (queryTags.length) {
      totalHits = tagResults['tags-total-hits'];
    } else {
      totalHits = siteResults['sites-total-hits'][req.dbQuery.hostname] || 0;
    }

    return {
      root_url: req.url.replace(/\?.*/, ''),
      isAdmin: isAdmin,
      hostname: req.params.hostname,
      pageHitsPerPage: pageViewResults.hits_per_page,
      pageHitsPerDay: pageViewResults.hits_per_day.__all,
      referrers: pageViewResults.referrers.by_count.slice(0, 20),
      startDate: req.start,
      endDate: req.end,
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

