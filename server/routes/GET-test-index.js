/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config');
const logger = require('../lib/logger');
const client_resources = require('../lib/client-resources');


logger.info("env: %s", config.get('env'));
if (config.get('env') !== 'test') return;

logger.info('woohoo! we are testing!');

exports.path = /tests\/(?:index\.html)?/;
exports.verb = 'get';
exports.authorization = require('../lib/page-authorization').ANY;

exports.handler = function(req, res) {
  res.render('GET-test-index.html', {
    resources: client_resources.testing('rum-diary.min.js')
  });
};
