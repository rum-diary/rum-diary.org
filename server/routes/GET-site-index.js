/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Show a list of hostnames.

const logger = require('../lib/logger');
const calculator = require('../lib/calculator');


exports.path = '/site';
exports.verb = 'get';
exports.template = 'GET-site-index.html';

exports.handler = function (req, res) {
  return calculator.calculate({
    site: {
      'site:hostname': {
        // TODO add a user filter.
        sort: 'asc'
      }
    }
  }).then(function (allResults) {
    return {
      sites: allResults.site['site:hostname']
    };
  });
};
