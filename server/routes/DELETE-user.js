/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a user.

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');
const users = require('../lib/data-layer/user');

exports.path = '/user/:email';
exports.method = 'delete';
exports.authorization = require('../lib/page-authorization').AUTHENTICATED;

exports.validation = {
  _csrf: inputValidation.csrf()
};


exports.handler = function (req, res) {
  var sessionEmail = req.session.email;
  var specifiedEmail = req.params.email;

  if (sessionEmail !== specifiedEmail) throw httpErrors.ForbiddenError();

  return users.remove(sessionEmail)
    .then(function () {
      req.session.destroy();
      res.redirect('/user');
    });
};
