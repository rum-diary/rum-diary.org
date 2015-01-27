/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const gzip_static = require('connect-gzip-static');
const cachify = require('connect-cachify');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const common = require('rum-diary-server-common');

const config = require('./lib/config');
const templates = require('./lib/templates');

const httpServer = common.httpServer;

const logger = common.logging(common.configAdapter(config, 'logging'));

const csrf = require('./lib/middleware/csrf');
const session = require('./lib/middleware/session');
const errorHandler = require('./lib/middleware/error');
const siteQuery = require('./lib/middleware/site-query');


const SessionStore = require('./lib/session-store');

const STATIC_ROOT = path.join(config.get('static_root'),
                                config.get('static_dir'));
const ROUTES_ROOT = path.join(__dirname, 'routes');

SessionStore.create().then(function (sessionStore) {
  const app = common.app();

  templates.setup(app);

  app.use(common.middleware.logging(logger));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

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

  app.disable('x-powered-by');

  app.use(siteQuery);

  // Get all of our routes.
  app.use(common.router({
    cwd: ROUTES_ROOT
  }));

  // set up cachify before the static middleware to strip off any md5's then
  // serve up the correct gzipped item.
  app.use(cachify.setup({}, {
    root: STATIC_ROOT
  }));

  // Static middleware is last.
  app.use(gzip_static(STATIC_ROOT, { force: true }));

  app.use(errorHandler);

  httpServer.start(app, logger, common.configAdapter(config, 'server'));
});
