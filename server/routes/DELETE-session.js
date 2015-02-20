/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a user's session.

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');

exports.path = '/session';
exports.method = 'delete';
exports.authorization = require('../lib/page-authorization').AUTHENTICATED;

exports.validation = {
  _csrf: inputValidation.csrf()
};


exports.handler = function (req, res) {
  const email = req.session.email;

  if (! email) {
    return httpErrors.BadRequestError();
  }

  req.session.destroy();

  res.redirect('/user');
};
