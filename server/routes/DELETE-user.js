/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a user.

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const authorization = config.authorization;
  const users = config.users;

  return {
    path: '/user/:email',
    method: 'delete',
    authorization: authorization.AUTHENTICATED,

    validation: {
      _csrf: inputValidation.csrf()
    },

    handler: function (req, res) {
      const sessionEmail = req.session.email;
      const specifiedEmail = req.params.email;

      if (sessionEmail !== specifiedEmail) {
        throw httpErrors.ForbiddenError();
      }

      return users.remove(sessionEmail)
        .then(function () {
          req.session.destroy();
          res.redirect('/user');
        });
    }
  };
};
