/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Placeholder to sign a user in.

module.exports = function (config) {
  const authorization = config.authorization;
  const clientResources = config.clientResources;

  return {
    path: '/user',
    method: 'get',
    template: 'GET-user-index.html',

    locals: {
      resources: clientResources.get('js/signin.min.js')
    },

    authorization: authorization.ANY,

    handler: function (req, res) {
      return {};
    }
  };
};
