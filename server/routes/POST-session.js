/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sign in an existing user.

const db = require('../lib/db');
const verifier = require('../lib/verifier');
const httpErrors = require('../lib/http-errors');

exports.path = '/session';
exports.verb = 'post';

exports.handler = function (req, res) {
  const assertion = req.body.assertion;

  return verifier.verify(assertion)
     .then(function (email) {
        // Check if user already exists.
        return db.user.getOne({
          email: email
        });
      })
     .then(function (existingUser) {
        // uh oh, user does not exist.
        if (! existingUser) return httpErrors.ForbiddenError();

        // sign the user in, visit their list of sites.
        req.session.email = existingUser.email;

        res.redirect('/site');
      });
};
