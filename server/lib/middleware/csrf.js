/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// set up a middleware to add & check CSRF tokens on all POST requests
// except POST /metrics. POST /metrics is the only API call available
// to RP users, and adding a CSRF token would give us the ability to track
// their users, something to avoid.
//
// Tracking our own users, while on our site. That's OK.

const csrfMiddleware = require('csurf')();

module.exports = function () {
  return function (req, res, next) {
    // These two do not require CSRF tokens.
    if (req.url === '/include.js') return next();
    if (req.url === '/metrics') return next();

    csrfMiddleware(req, res, function () {
      // All other requests get a csrf token, the logout button is a form POST.
      res.locals.csrftoken = req.csrfToken();
      next();
    });
  }
};
