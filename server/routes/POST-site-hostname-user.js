/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sites = require('../lib/site');
const invitations = require('../lib/invite');
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');
const accessLevels = require('rum-diary-access-levels');

exports.path = '/site/:hostname/user';
exports.method = 'post';
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
  return sites.setUserAccessLevel(hostname, email, accessLevel)
    .then(function () {
      return invitations.createAndSendIfNotAlreadyInvited({
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
