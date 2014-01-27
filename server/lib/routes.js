/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const corsMiddleware = cors();
const Router = require('express').Router;
const router = new Router();

const ROUTES_DIR = path.join(__dirname, '..', 'routes');

// All routes are loaded from the individual files in the routes subdirectory.
// Each .js file in the routes subdirectory should contain 3 fields:
//  * verb - get, post, put, delete, etc.
//  * path - path the respond to
//  * handler - function to handle the route.
loadAllRoutes();

function loadAllRoutes() {
  var files = fs.readdirSync(ROUTES_DIR);
  files.forEach(loadRoute);
}

function loadRoute(fileName) {
  if (path.extname(fileName) !== '.js') return;

  var routePath = path.join(ROUTES_DIR, fileName);
  var route = require(routePath);

  if ( ! (route.path && route.verb)) return;
  if (route.enable_cors) {
    router[route.verb](route.path, corsMiddleware, route.handler);
  } else {
    router[route.verb](route.path, route.handler);
  }
}

module.exports = router;

