/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const session = require('express-session');
const config = require('../config');

const userCollection = require('../db').user;

module.exports = function (options) {
  const sessionMiddleware = createSessionMiddleware(options);

  return function middlewareProxy(req, res, next) {
    if (isUrlSessionless(req.url)) return next();

    sessionMiddleware(req, res, validateSession.bind(null, req, res, next));
  };
};

function createSessionMiddleware(options) {
  return session({
    cookie: {
      maxAge: config.get('session_duration_ms'),
      httpOnly: true,
      secure: config.get('ssl'),
    },
    name: config.get('session_cookie_name'),
    secret: config.get('session_cookie_secret'),
    store: options.sessionStore,
    resave: false,
    saveUninitialized: true
  });
}

// These items do not receive cookies because they are part of
// the RP API. Eliminate the ability to track their users.
const SESSIONLESS_URLS = {
  '/include.js': 1,
  '/navigation': 1,
  '/unload': 1
};

function isUrlSessionless(url) {
  return SESSIONLESS_URLS[url];
}

function validateSession(req, res, next) {
  var email = req.session.email;
  if (email) {
    return checkUserExists(email, req, res, next);
  }

  next();
}

function checkUserExists(email, req, res, next) {
  userCollection.getOne({ email: email })
    .then(function (user) {
      if (! user) {
        return destroySessionAndRedirect(req, res);
      }

      next();
    });
}

function destroySessionAndRedirect(req, res) {
  // user no longer exists, delete the session.
  req.session.destroy(function () {
    res.redirect('/user');
  });
}

