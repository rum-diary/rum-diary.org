/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');
const logger = require('../logger');

logger.info("env: %s", config.get('env'));
if (config.get('env') !== 'test') return;

logger.info('woohoo! we are testing!');

const client_resources = require('../client-resources');

exports.path = '/tests/(?:index\.html)?';
exports.verb = 'get';

exports.handler = function(req, res) {
  res.render('GET-test-index.html', {
    resources: client_resources.testing('rum-diary.min.js')
  });
};
