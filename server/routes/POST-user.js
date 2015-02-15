/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const inputValidation = require('../lib/input-validation');
const users = require('../lib/user');
const sites = require('../lib/site');
const verifier = require('../lib/verifier');

exports.path = '/user';
exports.method = 'post';
exports.authorization = require('../lib/page-authorization').NOT_AUTHENTICATED;

exports.validation = {
  _csrf: inputValidation.csrf(),
  name: inputValidation.userRealName().required(),
  hostname: inputValidation.hostname().required(),
  assertion: inputValidation.assertion().required()
};

exports.handler = function (req, res) {
  const name = req.body.name;
  const hostname = req.body.hostname.replace(/^https?:\/\//, '');
  const assertion = req.body.assertion;

  var email;
  var isNewSite = false;
  var canViewExistingSite = false;

  return verifier.verify(assertion)
     .then(function (_email) {
        email = _email;

        return users.exists(email);
      })
     .then(function (userExists) {
        if (! userExists) {
          return users.create(name, email);
        }
      })
     .then(function () {
        return sites.exists(hostname)
      })
     .then(function (exists) {
        if (! exists) {
          // non-existent site - create it.
          isNewSite = true;
          return sites.create(hostname, email);
        }

        // site already exists, see if user is authorized.
        return sites.canView(hostname, email)
          .then(function (isAuthorized) {
            canViewExistingSite = isAuthorized;
          });
      })
     .then(function () {
        // sign the user in, visit their page.
        req.session.email = email;
        req.session.name = name;
        req.session.hostname = hostname;
        req.session.isNewSite = isNewSite;
        req.session.canViewExistingSite = canViewExistingSite;

        res.redirect('/welcome');
      });
};
