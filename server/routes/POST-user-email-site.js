/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientResources = require('../lib/client-resources');
const db = require('../lib/db');
const siteCollection = db.site;
const userCollection = db.user;
const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');

exports.path = '/user/:email/site';
exports.verb = 'post';
exports.authorization = require('../lib/page-authorization').IS_USER;

exports.validation = {
  _csrf: inputValidation.csrf(),
  hostname: inputValidation.hostname()
};

exports.handler = function (req, res, next) {
  var email = req.params.email;
  var hostname = req.body.hostname;

  return userCollection.getOne({
    email: email
  })
  .then(function (user) {
    if (! user) {
      throw httpErrors.NotFoundError();
    }

    return siteCollection.registerNewSite(hostname, email)
      .then(function() {
        return true;
      }, function (err) {
        // if the site already exists, inform the user, but do not fail.
        if (err.message === 'already exists') return false;

        // all other errors fail.
        throw err;
      });
  })
  .then(function (isCreated) {
    if (isCreated) {
      // go back to the original page.
      res.redirect(req.get('referrer'));
    } else {
      // site already exists, cannot create as owner, and cannot self add.
    }
  });
};
