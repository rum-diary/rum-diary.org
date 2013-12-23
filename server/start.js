/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const spdy = require('spdy');

const config = require('./lib/config');
const logger = require('./lib/logger');
const routes = require('./lib/routes.js');

var spdyServer = express();

nunjucks.configure(config.get('views_dir'), {
  autoescape: true,
  express: spdyServer
});
spdyServer.use(express.bodyParser());
spdyServer.use(cors());
spdyServer.use(express.logger({
  format: 'short',
  stream: {
    write: function(x) {
      logger.info(typeof x === 'string' ? x.trim() : x);
    }
  }
}));


spdyServer.use(routes.middleware);
spdyServer.use(express.static(config.get('static_dir')));

var spdyOptions = {
  key: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.key')),
  cert: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.bundle')),
  ssl: config.get('ssl'),
  plain: true
};

spdy.createServer(spdyOptions, spdyServer).listen(config.get('port'), function() {
  logger.info('listening on port', config.get('port'));
});

