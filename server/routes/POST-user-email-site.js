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

    return db.site.getOne({
      hostname: hostname
    });
  })
  .then(function (site) {
    if (! site) {
      // site doesn't exist, create it and be done.

      logger.info('create new site: %s', hostname);
      return db.site.create({
        hostname: hostname,
        admin_users: [ email ]
      });
    } else {
      // add user to existing site, if not already.
      logger.info('existing site: %s', hostname);
      if (site.admin_users.indexOf(email) === -1) {
        logger.info('add user to existing site: %s', hostname);
        site.admin_users.push(email);
        return db.site.update(site);
      }
    }
  })
  .then(function () {
    res.redirect('/user/' + encodeURIComponent(email));
  });
};
