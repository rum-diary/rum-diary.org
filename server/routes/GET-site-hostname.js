/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const p = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const siteCollection = db.site;
const calculator = require('rum-diary-calculator')({ db: db });
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname';
exports.method = 'get';
exports.template = 'GET-site-hostname.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function (req) {
  var email = req.session.email;
  var hostname = req.params.hostname;
  var startDate = req.start;
  var endDate = req.end;

  return p.all([
    siteCollection.isAuthorizedToAdministrate(email, hostname),
    calculator.siteTraffic(hostname, startDate, endDate)
  ]).spread(function (isAdmin, results) {
    logger.info('%s: elapsed time: %s ms', req.url, results.duration);

    return {
      root_url: req.url.replace(/\?.*/, ''),
      isAdmin: isAdmin,
      hostname: hostname,
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
        repeat: results.hits.repeate
      },
      annotations: results.annotations
    };
  });
};

