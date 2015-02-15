/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const calculator = require('./calculator');
const db = require('./db');

exports.exists = function (email) {
  return db.user.getOne({ email: email })
    .then(function (user) {
      return !! user;
    });
};

exports.create = function (name, email) {
  return db.user.create({
    name: name,
    email: email
  });
};


