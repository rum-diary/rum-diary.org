/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const siteCollection = db.site;
const inputValidation = require('../lib/input-validation');
const accessLevels = require('../lib/access-levels');

exports.path = '/site/:hostname/user';
exports.verb = 'delete';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.validation = {
  _csrf: inputValidation.csrf(),
  email: inputValidation.email()
};

exports.handler = function (req, res) {
  var hostname = req.params.hostname;
  var email = req.body.email;

  return siteCollection.setUserAccessLevel(email, hostname, accessLevels.NONE)
    .then(function () {
      // go back to the original page.
      res.redirect(req.get('referrer'));
    });
};
