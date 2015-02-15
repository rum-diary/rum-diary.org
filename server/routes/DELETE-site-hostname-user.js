/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const siteCollection = require('../lib/site');
const inputValidation = require('../lib/input-validation');
const accessLevels = require('rum-diary-access-levels');

exports.path = '/site/:hostname/user';
exports.method = 'delete';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.validation = {
  _csrf: inputValidation.csrf(),
  email: inputValidation.email()
};

exports.handler = function (req, res) {
  var hostname = req.params.hostname;
  var email = req.body.email;

  return siteCollection.setUserAccessLevel(hostname, email, accessLevels.NONE)
    .then(function () {
      // go back to the original page.
      res.redirect(req.get('referrer'));
    });
};
