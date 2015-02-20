/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const logger = config.logger;
  const invitations = config.invitations;

  function verifyNewUserThenRedirect(req, res, tokenInfo, name) {
    return invitations.verifyNewUser(tokenInfo.token, name)
      .then(function () {
        req.session.email = tokenInfo.to_email;

        res.redirect('/site/' + tokenInfo.hostname);
      });
  }

  return {
    path: '/invitation/:token',
    method: 'post',
    template: 'GET-invitation-token.html',
    authorization: require('../lib/page-authorization').ANY,

    validation: {
      _csrf: inputValidation.csrf(),
      name: inputValidation.userRealName().required()
    },

    handler: function (req, res) {
      var token = req.params.token;
      var name = req.body.name;

      return invitations.tokenInfo(token)
        .then(function (tokenInfo) {
          if (! tokenInfo.isValid) {
            logger.warn('invalid token: %s', token);
            throw new httpErrors.GoneError();
          }

          if (tokenInfo.doesInviteeExist) {
            logger.warn('invitee already exists: %s', tokenInfo.to_email);
            throw new httpErrors.ForbiddenError();
          }

          return verifyNewUserThenRedirect(req, res, tokenInfo, name);
        });
    }
  };
};
