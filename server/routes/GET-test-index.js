/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (config) {
  const env = config.config.get('env');
  const authorization = config.authorization;
  const clientResources = config.clientResources;

  return {
    path: /tests\/(?:index\.html)?/,
    method: 'get',
    authorization: authorization.ANY,
    locals: {
      resources: clientResources.testing('js/rum-diary.min.js')
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
