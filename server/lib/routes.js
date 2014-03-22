/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const cors = require('cors');
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
  addRoute(route, router);
}

// router is passed in for testing.
function addRoute(route, router) {
  if ( ! (route.path && route.verb)) return new Error('invalid route');

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
  function handler(req, res, next) {
    // Set up some helpers on the request.
    req.dbQuery = getQuery(req);
    req.start = req.dbQuery.start;
    req.end = req.dbQuery.end;

    var value = route.handler(req, res, next);
    if (value) {
      if (value instanceof Error) {
        return renderError(value);
      } else if (value.then) {
        return value.then(render, renderError);
      }
      render(value);
    }

    function renderError(err) {
      var httpStatusCode = err.httpError || 500;
      logger.error('%s(%s): %s', route.path, httpStatusCode, String(err));
      res.send(httpStatusCode, err.message);
    }

    function render(templateData) {
      if (templateData && route.template) {
        if (templateData.resources && route['js-resources']) {
          logger.warn('%s: route defines `js-resources`, returned `resources` will be ignored. Pick one.', req.url);
        }
        templateData.resources = route['js-resources'];
        res.render(route.template, templateData);
      }
    }
  }

  if (route.enable_cors) {
    router[route.verb](route.path, corsMiddleware, handler);
  } else {
    router[route.verb](route.path, handler);
  }
}

module.exports = router.middleware;
module.exports.loadRoute = loadRoute;
module.exports.addRoute = addRoute;
