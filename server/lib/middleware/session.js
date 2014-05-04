/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const config = require('../config');

module.exports = function (options) {
  const sessionMiddleware = express.session({
    cookie: {
      maxAge: config.get('session_duration_ms'),
      httpOnly: true,
      secure: config.get('ssl'),
    },
    key: config.get('session_cookie_name'),
    secret: config.get('session_cookie_secret'),
    store: options.sessionStore
  });

  return function (req, res, next) {
    // These items do not receive cookies because they are part of
    // the RP API. Eliminate the ability to track their users.
    if (req.url === '/include.js') return next();
    if (req.url === '/navigation') return next();
    if (req.url === '/unload') return next();

    sessionMiddleware(req, res, next);
  };
};


