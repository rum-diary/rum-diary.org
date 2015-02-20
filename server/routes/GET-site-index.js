/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Show a list of hostnames.

module.exports = function (config) {
  const users = config.users;
  const authorization = config.authorization;

  return {
    path: '/site',
    method: 'get',
    template: 'GET-site-index.html',
    authorization: authorization.AUTHENTICATED,

    handler: function (req) {
      const email = req.session.email;

      return users.sites(email)
        .then(function (sites) {
          return {
            sites: sites,
            email: email
          };
        });
    }
  };
};
