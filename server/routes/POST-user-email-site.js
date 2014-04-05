/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientResources = require('../lib/client-resources');
const db = require('../lib/db');
const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');

exports.path = '/user/:email/site';
exports.verb = 'post';
exports.authorization = require('../lib/page-authorization').IS_USER;

exports.validation = {
  _csrf: inputValidation.csrf(),
  hostname: inputValidation.hostname(),
  assertion: inputValidation.assertion()
};

exports.handler = function (req, res, next) {
  var email = req.params.email;
  var hostname = req.body.hostname;

  var userModel, siteModel;

  return db.user.getOne({
    email: email
  })
  .then(function (user) {
    if (! user) {
      throw httpErrors.NotFoundError();
    }

    userModel = user;

    // create site if it does not already exist.
    return db.site.ensureExists(hostname);
  })
  .then(function (site) {
    if (site.admin_users.indexOf(email) === -1) {
      site.admin_users.push(email);
      return db.site.update(site);
    }
  })
  .then(function () {
    // go back to the original page.
    res.redirect(req.get('referrer'));
  });
};
