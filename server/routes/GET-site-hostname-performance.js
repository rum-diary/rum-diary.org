/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const db = require('../lib/db');
const siteCollection = db.site;
const ReducingStream = require('rum-diary-queries');
const clientResources = require('../lib/client-resources');
const navigationTimingFields = require('../lib/navigation-timing');

exports.path = '/site/:hostname/performance';
exports.method = 'get';
exports.template = 'GET-site-hostname-performance.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  var pageViewQuery = req.dbQuery;
  pageViewQuery.hostname = req.params.hostname;

  var reduceStream = new ReducingStream({
    which: ['navigation', 'navigation-histogram', 'navigation-cdf'],
    start: req.start,
    end: req.end,
    navigation: {
      calculate: ['25', '50', '75']
    },
    'navigation-histogram': {
      statName: statName
    },
    'navigation-cdf': {
      statName: statName
    }
  });

  return Promise.all([
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.params.hostname),
    db.pageView.pipe(pageViewQuery, null, reduceStream)
  ]).then(function(allResults) {

    var isAdmin = allResults[0];
    var performanceResults = reduceStream.result();

    reduceStream.end();
    reduceStream = null;

    return {
      baseURL: req.url.replace(/\?.*/, ''),
      histogram: performanceResults['navigation-histogram'],
      cdf: performanceResults['navigation-cdf'],
      statName: statName,
      hostname: req.params.hostname,
      startDate: req.start.format('MMM DD'),
      endDate: req.end.format('MMM DD'),
      navigationTimingFields: navigationTimingFields,
      first_q: performanceResults.navigation['25'],
      second_q: performanceResults.navigation['50'],
      third_q: performanceResults.navigation['75'],
      isAdmin: isAdmin
    };
  });
};

