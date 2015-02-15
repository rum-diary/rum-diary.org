/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sign in an existing user.

const inputValidation = require('../lib/input-validation');
const user = require('../lib/user');
const verifier = require('../lib/verifier');
const httpErrors = require('../lib/http-errors');

exports.path = '/session';
exports.method = 'post';
exports.authorization = require('../lib/page-authorization').ANY;

exports.validation = {
  _csrf: inputValidation.csrf(),
  assertion: inputValidation.assertion()
};


exports.handler = function (req, res) {
  const assertion = req.body.assertion;
  const redirectTo = decodeURIComponent(req.session.redirectTo || '/site');

  delete req.session.redirectTo;

  var email;

  return verifier.verify(assertion)
    .then(function (_email) {
      email = _email;
       // Check if user already exists.
       return user.exists(email);
    })
    .then(function (exists) {
      // uh oh, user does not exist.
      if (! exists) {
        throw httpErrors.ForbiddenError();
      }

      // sign the user in, visit their list of sites.
      req.session.email = email;
      res.redirect(redirectTo);
    });
};
