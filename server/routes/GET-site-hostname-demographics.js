/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const p = require('bluebird');
const db = require('../lib/db');
const siteCollection = db.site;
const calculator = require('rum-diary-calculator')({ db: db });
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/demographics';
exports.method = 'get';
exports.template = 'GET-site-hostname-demographics.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var email = req.session.email;
  var hostname = req.params.hostname;
  var startDate = req.start;
  var endDate = req.end;

  return p.all([
    siteCollection.isAuthorizedToAdministrate(email, hostname),
    calculator.siteDemographics(hostname, startDate, endDate)
  ]).spread(function(isAdmin, demographicsResults) {

    return {
      isAdmin: isAdmin,
      hostname: hostname,
      startDate: startDate.format('MMM DD'),
      endDate: endDate.format('MMM DD'),
      browsers: demographicsResults.browsers,
      os: demographicsResults.os,
      os_form: demographicsResults.os_form
    };
  });
};

