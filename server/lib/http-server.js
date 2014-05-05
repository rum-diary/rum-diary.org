/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// set up http redirect. Put this on its own process perhaps?

const express = require('express');
const config = require('./config');
const logger = require('./logger');

const HTTPS_PORT = config.get('https_port');
const HTTP_PORT = config.get('http_port');

exports.start = function () {
  // allow http protocol for local testing.
  const protocol = config.get('ssl') ? 'https://' : 'http://';
  const redirectTo = protocol + config.get('hostname') + (HTTPS_PORT !== 443 ? ':' + HTTPS_PORT : '');

  const http =  express();
  http.disable('x-powered-by');
  http.get('*',function(req, res){
    res.redirect(301, redirectTo + req.url);
  });

  http.listen(HTTP_PORT, function() {
    logger.info('http listening on port', HTTP_PORT);
  });
};

