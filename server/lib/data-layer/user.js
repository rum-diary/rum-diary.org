/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (db, calculator) {
  return {
    exists: function (email) {
      return db.user.getOne({ email: email })
        .then(function (user) {
          return !! user;
        });
    },

    get: function (email) {
      return db.user.getOne({ email: email });
    },

    create: function (name, email) {
      return db.user.create({
        name: name,
        email: email
      });
    },

    remove: function (email) {
      return db.user.deleteUser(email);
    },

    sites: function (email) {
      return calculator.usersSites(email);
    }
  };
};
