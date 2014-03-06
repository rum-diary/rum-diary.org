/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Promise = require('bluebird');

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const logger = require('../lib/logger');

exports.path = '/site/:hostname/performance';
exports.verb = 'get';
exports.template = 'GET-site-hostname-performance.html';
exports['js-resources'] = clientResources('rum-diary.min.js');

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

  return db.pageView.pipe(req.dbQuery, null, reduceStream)
            .then(function(results) {
              reduceStream.end();
              reduceStream = null;

              return {
                baseURL: req.url.replace(/\?.*/, ''),
                histogram: results['navigation-histogram'],
                cdf: results['navigation-cdf'],
                statName: statName,
                hostname: req.params.hostname,
                startDate: req.start.format('MMM DD'),
                endDate: req.end.format('MMM DD'),
                navigationTimingFields: getNavigationTimingFields(),
                first_q: results.navigation['25'],
                second_q: results.navigation['50'],
                third_q: results.navigation['75']
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

