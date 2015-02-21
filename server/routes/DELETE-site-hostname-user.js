/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const accessLevels = require('rum-diary-access-levels');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const authorization = config.authorization;
  const sites = config.sites;

  return {
    path: '/site/:hostname/user',
    method: 'delete',
    authorization: authorization.CAN_ADMIN_HOST,

    validation: {
      _csrf: inputValidation.csrf(),
      email: inputValidation.email()
    },

    handler: function (req, res) {
      const hostname = req.params.hostname;
      const email = req.body.email;

      return sites.setUserAccessLevel(hostname, email, accessLevels.NONE)
        .then(function () {
          // go back to the original page.
          res.redirect(req.get('referrer'));
        });
    }
  };
};
