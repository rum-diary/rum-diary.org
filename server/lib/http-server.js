/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const config = require('./config');
const logger = require('./logger');
const http = require('http');

const HTTP_PORT = config.get('http_port');

exports.start = function (options) {

  http.createServer(options.app).listen(HTTP_PORT, function() {
    console.log('http listening on port', HTTP_PORT);
    logger.info('http listening on port', HTTP_PORT);
  });
};

