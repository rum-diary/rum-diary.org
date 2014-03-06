/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');
const corsMiddleware = cors();
const Router = require('express').Router;
const router = new Router();

const logger = require('./logger');
const getQuery = require('./site-query');

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

  /*
   * Set up a local handler for generic functionality
   * such as template rendering and error logging/display.
   * A route's `handler` function must return a promise.
   *
   * If the promise resolves and the route has a template,
   * the template will be written with the data passed
   * to the resolver. If the promise fails, the error
   * handler will be called with the error.
   */
  function handler(req, res) {
    // Set up some helpers on the request.
    req.dbQuery = getQuery(req);
    req.start = moment(req.dbQuery.createdAt.$gte);
    req.end = moment(req.dbQuery.createdAt.$lte);

    var promise = route.handler(req, res);
    if (promise && promise.then) {
      promise.then(function (templateData) {
        if (templateData && route.template) {
          templateData.resources = route['js-resources'];
          res.render(route.template, templateData);
        }
      }, function(err) {
        res.send(500);
        logger.error('%s: %s', fileName, String(err));
      });
    }
  }

  if (route.enable_cors) {
    router[route.verb](route.path, corsMiddleware, handler);
  } else {
    router[route.verb](route.path, handler);
  }
}

module.exports = router;

