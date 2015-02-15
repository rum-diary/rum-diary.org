/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const calculator = require('./calculator');
const db = require('./db');

exports.canAdminister = function (hostname, email) {
  return db.site.isAuthorizedToAdministrate(email, hostname);
};

exports.traffic = calculator.siteTraffic;
exports.demographics = calculator.siteDemographics;
exports.performance = calculator.sitePerformance;
exports.referrals = calculator.siteReferrer;
