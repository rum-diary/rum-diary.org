/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const path = require('path');
const gzip_static = require('connect-gzip-static');
const helmet = require('helmet');
const cachify = require('connect-cachify');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const config = require('./lib/config');
const routes = require('./lib/routes.js');
const templates = require('./lib/templates');

const httpServer = require('./lib/http-server');
const httpsServer = require('./lib/https-server');

const csrf = require('./lib/middleware/csrf');
const logging = require('./lib/middleware/logging');
const session = require('./lib/middleware/session');

const SessionStore = require('./lib/session-store');

const STATIC_ROOT = path.join(config.get('static_root'),
                                config.get('static_dir'));


SessionStore.create().then(function (sessionStore) {
  const app = express();

  templates.setup(app);

  app.use(logging({ app: app }));

  app.use(bodyParser());

  // allow PUT/DELETE methods via POST in HTML forms.
  // requires bodyParser.
  app.use(methodOverride());

  app.use(cookieParser());

  // requires cookieParser.
  app.use(session({
    sessionStore: sessionStore
  }));

  // requires both cookieParser and bodyParser.
  app.use(csrf());

  app.use(helmet.xframe('deny'));

  if (config.get('ssl')) {
    app.use(helmet.hsts());
  }

  app.use(helmet.iexss());
  app.use(helmet.contentTypeOptions());

  app.disable('x-powered-by');

  app.use(helmet.csp({
    'default-src': ['\'self\'', 'https://login.persona.org']
  }));

  // Get all of our routes.
  app.use(routes);

  // set up cachify before the static middleware to strip off any md5's then
  // serve up the correct gzipped item.
  app.use(cachify.setup({}, {
    root: STATIC_ROOT
  }));

  // Static middleware is last.
  app.use(gzip_static(STATIC_ROOT, { force: true }));

  httpsServer.start({ app: app });
  httpServer.start();
});
