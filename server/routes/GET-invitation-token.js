/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../lib/http-errors');

module.exports = function (config) {
  const invitations = config.invitations;
  const logger = config.logger;
  const authorization = config.authorization;

  function verifyExistingUserThenRedirect(req, res, tokenInfo) {
    return invitations.verifyExistingUser(tokenInfo.token)
      .then(function () {
        req.session.email = tokenInfo.to_email;

        res.redirect('/site/' + tokenInfo.hostname);
      });
  }

  return {
    path: '/invitation/:token',
    method: 'get',
    template: 'GET-invitation-token.html',
    authorization: authorization.ANY,

    handler: function (req, res) {
      const token = req.params.token;

      return invitations.tokenInfo(token)
        .then(function (tokenInfo) {
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
    }
  };
};
