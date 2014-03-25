/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../lib/http-errors');
const db = require('../lib/db');
const clientResources = require('../lib/client-resources');

exports.path = '/user/:email';
exports.verb = 'get';
exports.template = 'GET-user-email.html';
exports['js-resources'] = clientResources('rum-diary.min.js');

exports.handler = function (req, res, next) {
  var email = decodeURIComponent(req.params.email);

  if (email === 'new') return next();

  if (! isUserAuthorized(req)) {
    throw httpErrors.ForbiddenError();
  }

  return db.user.getOne({
    email: email
  })
  .then(function (user) {
    if (! user) {
      throw httpErrors.NotFoundError();
    }

    return db.site.get({
      admin_users: email
    }).then(function(models) {
      user.sites = models;
      return user;
    });
  });
};

function isUserAuthorized(req) {
  var email = decodeURIComponent(req.params.email);
  return req.session.email === email;
}
