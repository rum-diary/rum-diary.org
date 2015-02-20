/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const calculator = require('../lib/data-layer/calculator');
const clientResources = require('../lib/client-resources');

exports.method = 'get';
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
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var hostname = req.params.hostname;
  var path = req.params.path;
  var startDate = req.start;
  var endDate = req.end;

  return calculator.pageTraffic(hostname, path, startDate, endDate)
    .then(function (results) {
    return {
      root_url: req.url.replace(/\?.*/, ''),
      hostname: hostname,
      path: path,
      startDate: startDate,
      endDate: endDate,
      pageHitsPerPage: results.pageHitsPerPage,
      pageHitsPerDay: results.pageHitsPerDay,
      referrers: results.referrers,
      hits: {
        total: results.hits.total,
        period: results.hits.period,
        today: results.hits.today,
        unique: results.hits.unique,
        repeat: results.hits.repeat,
        exitRate: results.hits.exitRate,
        bounceRate: results.hits.bounceRate
      },
      medianReadTime: results.medianReadTime,
      internalTransfer: {
        from: results.internalTransfer.from
      }
    };
  });
};
