/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const calculator = require('../lib/calculator');
const clientResources = require('../lib/client-resources');

exports.verb = 'get';
exports.path = /\/site\/([\w\d][\w\d\-]*(?:\.[\w\d][\w\d\-]*)*)\/path\/(.*)?$/;

// Convert from the above regexp to named params
exports.setParams = function (req) {
  req.params.hostname = req.params[0];
  req.params.path = req.params[1] || 'index';

  if ( ! /^\//.test(req.params.path)) {
    req.params.path = '/' + req.params.path;
  }
};

exports.template = 'GET-site-hostname-path.html';
exports['js-resources'] = clientResources('rum-diary.min.js');
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var hostname = req.params.hostname;
  var path = req.params.path;

  req.dbQuery.path = path;

  return calculator.calculate({
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
      'returning': {},
      'read-time': {},
      'internal-transfer-from': {},
      'exit': {},
      'bounce': {}
    }
  }).then(function (allResults) {
    var results = allResults.pageView;

    var pageHitsInPeriod = results.hits_per_page[0].hits;

    var exitRate = calculateExitRate(results, path);
    var bounceRate = calculateBounceRate(results, path);

    return {
      root_url: req.url.replace(/\?.*/, ''),
      hostname: hostname,
      path: path,
      pageHitsPerPage: results.hits_per_page,
      pageHitsPerDay: results.hits_per_day.__all,
      referrers: results.referrers.by_count.slice(0, 20),
      startDate: req.start,
      endDate: req.end,
      hits: {
        total: 'N/A',//totalHits,
        period: pageHitsInPeriod,
        today: results.hits_per_day.__all[results.hits_per_day.__all.length - 1].hits,
        unique: results.unique,
        repeat: results.returning,
        exitRate: exitRate,
        bounceRate: bounceRate
      },
      medianReadTime: msToHoursMinsSeconds(results['read-time']),
      internalTransfer: {
        from: results['internal-transfer-from']['by_dest'][path]
      }
    };
  });
};


function msToHoursMinsSeconds(ms) {
  var seconds = ((ms || 0) / 1000) << 0;

  var hours = (seconds / 3600) << 0;
  var minutes = ((seconds - hours * 3600) / 60) << 0;
  seconds = (seconds % 60);

  return {
    hours: padLeft(hours, 0, 2),
    minutes: padLeft(minutes, 0, 2),
    seconds: padLeft(seconds, 0, 2)
  };
}

function padLeft(numToPad, padWith, length) {
  var padded = '' + numToPad;

  while(padded.length < length) {
    padded = padWith + padded;
  }

  return padded;
}

function calculateBounceRate(results, path) {
  var pageHitsInPeriod = results.hits_per_page[0].hits;
  if (! pageHitsInPeriod) return 0;

  var bouncesInPeriod = results.bounce[path];
  return (100 * bouncesInPeriod / pageHitsInPeriod) << 0;
}

function calculateExitRate(results, path) {
  var pageHitsInPeriod = results.hits_per_page[0].hits;
  if (! pageHitsInPeriod) return 0;

  var exitsInPeriod = results.exit[path];
  return (100 * exitsInPeriod / pageHitsInPeriod) << 0;
}

