/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const verifier = require('../lib/verifier');

exports.path = '/user/new';
exports.verb = 'post';

exports.handler = function (req, res) {
  const name = req.body.name;
  const assertion = req.body.assertion;

  var verifiedEmail;

  return verifier.verify(assertion)
     .then(function (email) {
        verifiedEmail = email;

        // Check if user already exists.
        return db.user.getOne({
          email: email
        });
      })
     .then(function (existingUser) {
        if (existingUser) {
          // TODO sign the user in instead.
          res.json({ success: false, reason: 'email already exists' });
        }

        return db.user.create({
          name: name,
          email: verifiedEmail
        });
      })
     .then(function (newUser) {
        res.redirect('/user/' + encodeURIComponent(verifiedEmail));
      });
};
