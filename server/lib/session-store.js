/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A MongoDB backed sessionStore for express. `create` must be called
 * before use. `create` returns a promise that will fulfill when ready.
 */

const Promise = require('bluebird');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const db = require('./db');

var resolver;
exports.create = function () {
  if (resolver) return resolver.promise;

  resolver = Promise.defer();

  // use the existing mongoose connection.
  return db.connect().then(function (connection) {
    var sessionStore = new MongoStore({
      mongoose_connection: connection,
      collection: 'sessions'
    });

    resolver.fulfill(sessionStore);
  }, function (err) {
    resolver.reject(err);
  });

  return resolver.promise;
};
