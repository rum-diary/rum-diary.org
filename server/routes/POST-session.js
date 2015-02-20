/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sign in an existing user.

const inputValidation = require('../lib/input-validation');
const httpErrors = require('../lib/http-errors');
const verifier = require('../lib/verifier');

module.exports = function (config) {
  const users = config.users;

  return {
    path: '/session',
    method: 'post',
    authorization: require('../lib/page-authorization').ANY,

    validation: {
      _csrf: inputValidation.csrf(),
      assertion: inputValidation.assertion()
    },


    handler: function (req, res) {
      const assertion = req.body.assertion;
      const redirectTo = decodeURIComponent(req.session.redirectTo || '/site');

      delete req.session.redirectTo;

      var email;

      return verifier.verify(assertion)
        .then(function (_email) {
          email = _email;
           // Check if user already exists.
           return users.exists(email);
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
    }
  };
};
