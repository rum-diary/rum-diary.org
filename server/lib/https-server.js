/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const spdy = require('spdy');
const config = require('./config');
const logger = require('./logger');
const ssl = require('./ssl');

const HTTPS_PORT = config.get('https_port');

exports.start = function (options) {
  // Set up SPDY.

  var isSslEnabled = config.get('ssl');

  var spdyOptions = {
    key: isSslEnabled && ssl.getKey(),
    cert: isSslEnabled && ssl.getCert(),
    ssl: isSslEnabled,
    plain: true
  };

  spdy.createServer(spdyOptions, options.app).listen(HTTPS_PORT, function() {
    logger.error('https listening on port', HTTPS_PORT);
  });
};

