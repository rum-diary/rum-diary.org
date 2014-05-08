/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const siteCollection = db.site;
const inviteCollection = db.invite;
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');
const accessLevels = require('../lib/access-levels');

exports.path = '/site/:hostname/user';
exports.verb = 'post';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.validation = {
  _csrf: inputValidation.csrf(),
  email: inputValidation.email(),
  access_level: inputValidation.accessLevel()
};

exports.handler = function (req, res) {
  var hostname = req.params.hostname;
  var email = req.body.email;
  var accessLevel = accessLevels[req.body.access_level];

  if (accessLevel === accessLevels.OWNER) {
    throw new Error('Cannot set the owner');
  }

  // Adds a user to the site whether they exist or not.
  logger.info('setting access level: %s, %s, %s', email, hostname, accessLevel);
  return siteCollection.setUserAccessLevel(email, hostname, accessLevel)
    .then(function () {
      return inviteCollection.createAndSendIfNotAlreadyInvited({
        from_email: req.session.email,
        to_email: email,
        hostname: hostname,
        access_level: accessLevel
      });
    })
    .then(function () {
      // go back to the original page.
      res.redirect(req.get('referrer'));
    });
};
