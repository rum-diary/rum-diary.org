/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const session = require('rum-diary-server-common').middleware.session;

const SESSIONLESS_URLS = [
  '/include.js',
  '/metrics'
];

module.exports = function (options) {
  var sessionStore = options.sessionStore;
  var config = options.config;
  var userCollection = options.userCollection;

  return createSessionMiddleware(sessionStore, config, function (req, res, next) {
    var email = req.session.email;
    if (! email) {
      next();
      return;
    }

    return checkUserExists(userCollection, email)
      .then(function (userExists) {
        if (! userExists) {
          destroySessionAndRedirect(req, res);
        } else {
          next();
        }
      });
  });
};

function createSessionMiddleware(sessionStore, config, validateSession) {
  return session({
    sessionStore: sessionStore,
    config: config,
    // These items do not receive cookies because they are part of
    // the RP API. Eliminate the ability to track their users.
    sessionlessUrls: SESSIONLESS_URLS,
    validateSession: validateSession
  });
}

function checkUserExists(userCollection, email) {
  return userCollection.getOne({ email: email })
    .then(function (user) {
      return !! user;
    });
}

function destroySessionAndRedirect(req, res) {
  // user no longer exists, delete the session.
  req.session.destroy(function () {
    res.redirect('/user');
  });
}

