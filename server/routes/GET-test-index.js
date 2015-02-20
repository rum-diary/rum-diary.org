/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const client_resources = require('../lib/client-resources');

module.exports = function (config) {
  const env = config.config.get('env');
  const authorization = config.authorization;

  return {
    path: /tests\/(?:index\.html)?/,
    method: 'get',
    authorization: authorization.ANY,
    locals: {
      resources: client_resources.testing('js/rum-diary.min.js')
    },

    template: 'GET-test-index.html',

    handler: function(req, res, next) {
      if (env !== 'test') {
        next();
        return false;
      }
    }
  };
};
