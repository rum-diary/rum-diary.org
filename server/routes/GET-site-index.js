/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Show a list of hostnames.

const logger = require('../lib/logger');
const calculator = require('../lib/calculator');
const httpError = require('../lib/http-errors');


exports.path = '/site';
exports.verb = 'get';
exports.template = 'GET-site-index.html';

exports.handler = function (req, res) {
  var email = req.session.email;
  if (! email) return [];//httpError.UnauthorizedError();

  return calculator.calculate({
    site: {
      filter: {
        // TODO add a readonly user filter.
        admin_users: email
      },
      'site:hostname': {
        sort: 'asc'
      }
    }
  }).then(function (allResults) {
    var sites = allResults ? allResults.site['site:hostname'] : []
    return {
      sites: sites
    };
  });
};
