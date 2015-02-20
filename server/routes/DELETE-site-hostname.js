/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a site.

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const sites = config.sites;

  return {
    path: '/site/:hostname',
    method: 'delete',
    authorization: require('../lib/page-authorization').IS_OWNER_HOST,

    validation: {
      _csrf: inputValidation.csrf(),
      hostname: inputValidation.hostname()
    },

    handler: function (req, res) {
      const hostname = req.params.hostname;
      const verificationHostname = req.body.hostname;

      // uh oh, verification hostname is not the same as the real hostname.
      if (hostname !== verificationHostname) {
        throw new httpErrors.ForbiddenError();
      }

      return sites.remove(hostname)
        .then(function () {
          res.redirect('/site');
        });
    }
  };
};
