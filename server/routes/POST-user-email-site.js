/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const logger = require('../lib/logger');
const clientResources = require('../lib/client-resources');

exports.path = '/user/:email/site';
exports.verb = 'post';

exports.handler = function (req, res, next) {
  var email = req.params.email;
  var hostname = req.body.hostname;

  var userModel, siteModel;

  return db.user.getOne({
    email: email
  })
  .then(function (user) {
    if (! user) {
      return res.send(404);
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
    // TODO - this should probably be based on the referrer.
    res.redirect('/user/' + encodeURIComponent(email));
  });
};
