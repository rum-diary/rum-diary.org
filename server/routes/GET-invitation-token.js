/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const inviteCollection = require('../lib/db').invite;
const httpErrors = require('../lib/http-errors');
const logger = require('../lib/logger');

exports.path = '/invitation/:token';
exports.verb = 'get';
exports.template = 'GET-invitation-token.html';
exports.authorization = require('../lib/page-authorization').ANY;


exports.handler = function(req, res) {
  var token = req.params.token;

  return inviteCollection.tokenInfo(token)
      .then(function(tokenInfo) {
        if (! tokenInfo.isValid) {
          logger.warn('invalid token: %s', token);
          throw new httpErrors.GoneError();
        }

        if (tokenInfo.doesInviteeExist) {
          return verifyExistingUserThenRedirect(req, res, tokenInfo);
        }

        // user has to give us their real name.
        return tokenInfo;
      });
};

function verifyExistingUserThenRedirect(req, res, tokenInfo) {
  return inviteCollection.verifyExistingUser(tokenInfo.token)
    .then(function () {
      req.session.email = tokenInfo.to_email;

      res.redirect('/site/' + tokenInfo.hostname);
    });
}
