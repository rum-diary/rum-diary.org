/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const db = require('../lib/db');
const siteCollection = db.site;
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/performance';
exports.verb = 'get';
exports.template = 'GET-site-hostname-performance.html';
exports['js-resources'] = clientResources('js/rum-diary.min.js');
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  var reduceStream = new reduce.StreamReduce({
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
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.dbQuery.hostname),
    db.pageView.pipe(req.dbQuery, null, reduceStream)
  ]).then(function(allResults) {
    reduceStream.end();
    reduceStream = null;

    var isAdmin = allResults[0];
    var performanceResults = allResults[1];

    return {
      baseURL: req.url.replace(/\?.*/, ''),
      histogram: performanceResults['navigation-histogram'],
      cdf: performanceResults['navigation-cdf'],
      statName: statName,
      hostname: req.params.hostname,
      startDate: req.start.format('MMM DD'),
      endDate: req.end.format('MMM DD'),
      navigationTimingFields: getNavigationTimingFields(),
      first_q: performanceResults.navigation['25'],
      second_q: performanceResults.navigation['50'],
      third_q: performanceResults.navigation['75'],
      isAdmin: isAdmin
    };
  });
};

function getNavigationTimingFields() {
  return Object.keys({
    'navigationStart': Number,
    'unloadEventStart': Number,
    'unloadEventEnd': Number,
    'redirectStart': Number,
    'redirectEnd': Number,
    'fetchStart': Number,
    'domainLookupStart': Number,
    'domainLookupEnd': Number,
    'connectStart': Number,
    'connectEnd': Number,
    'secureConnectionStart': Number,
    'requestStart': Number,
    'responseStart': Number,
    'responseEnd': Number,
    'domLoading': Number,
    'domInteractive': Number,
    'domContentLoadedEventStart': Number,
    'domContentLoadedEventEnd': Number,
    'domComplete': Number,
    'loadEventStart': Number,
    'loadEventEnd': Number
  });
}

