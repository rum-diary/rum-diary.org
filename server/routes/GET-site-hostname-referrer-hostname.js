/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promises = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const siteCollection = db.site;
const calculator = require('rum-diary-calculator')({ db: db });
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/referrer/:referrer';
exports.method = 'get';
exports.template = 'GET-site-hostname-referrer-hostname.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function (req) {
  var hostname = req.params.hostname;
  var referrerHostname = req.params.referrer;
  var startDate = req.start;
  var endDate = req.end;

  return Promises.all([
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.params.hostname),
    calculator.siteReferrer(hostname, referrerHostname, startDate, endDate)
  ]).spread(function (isAdmin, referrals) {
    logger.info('%s: elapsed time: %s ms', req.url, referrals.duration);

    return {
      isAdmin: isAdmin,
      hostname: req.params.hostname,
      referrer: req.params.referrer,
      referrals: referrals.referrals,
      startDate: req.start,
      endDate: req.end
    };
  });
};
