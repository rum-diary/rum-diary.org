/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Show a list of hostnames.

const user = require('../lib/user');

exports.path = '/site';
exports.method = 'get';
exports.template = 'GET-site-index.html';
exports.authorization = require('../lib/page-authorization').AUTHENTICATED;

exports.handler = function (req) {
  var email = req.session.email;

  return user.sites(email)
    .then(function (sites) {
      return {
        sites: sites,
        email: email
      };
    });
};
