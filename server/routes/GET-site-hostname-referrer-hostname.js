/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promises = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');
const siteCollection = db.site;
const calculator = require('../lib/calculator');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/referrer/:referrer';
exports.method = 'get';
exports.template = 'GET-site-hostname-referrer-hostname.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function (req) {
  var pageViewQuery = req.dbQuery;
  pageViewQuery.hostname = req.params.hostname;
  pageViewQuery.referrer_hostname = req.params.referrer;

  return Promises.all([
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.params.hostname),
    calculator.calculate({
      pageView: {
        filter: pageViewQuery,
        'referrers': {},
      }
    })
  ]).then(function (allResults) {
    var isAdmin = allResults[0];
    var calculatorResults = allResults[1];

    logger.info('%s: elapsed time: %s ms', req.url, calculatorResults.duration);

    var referralsByPath = calculatorResults.pageView.referrers.by_hostname_to_path[req.params.referrer];
    var referrals = referralsByPath ? sortReferrals(referralsByPath) : null;

    return {
      isAdmin: isAdmin,
      hostname: req.params.hostname,
      referrer: req.params.referrer,
      referrals: referrals,
      startDate: req.start,
      endDate: req.end
    };
  });

  function sortReferrals(referralsByPath) {
    return Object.keys(referralsByPath).map(function(path) {
                      return {
                        path: path,
                        count: referralsByPath[path]
                      };
                    }).sort(function (a, b) {
                      return b.count - a.count;
                    });
  }
};
