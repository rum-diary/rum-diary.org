/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const calculator = require('./calculator');
const db = require('./db');

exports.exists = function (hostname) {
  return db.site.getOne({ hostname: hostname })
    .then(function (site) {
      return !! site;
    });
};

exports.create = function (hostname, email) {
  return db.site.registerNewSite(hostname, email);
};

exports.remove = function (hostname) {
  return db.site.findOneAndDelete({ hostname: hostname });
};

exports.canAdminister = function (hostname, email) {
  return db.site.isAuthorizedToAdministrate(email, hostname);
};

exports.canView = function (hostname, email) {
  return db.site.isAuthorizedToView(email, hostname);
};

exports.isOwner = function (hostname, email) {
  return db.site.isOwner(email, hostname);
};

exports.setUserAccessLevel = function (hostname, email, accessLevel) {
  return db.site.setUserAccessLevel(email, hostname, accessLevel);
};

exports.traffic = calculator.siteTraffic;
exports.demographics = calculator.siteDemographics;
exports.performance = calculator.sitePerformance;
exports.referrals = calculator.siteReferrer;
exports.adminInfo = calculator.siteAdmin;
