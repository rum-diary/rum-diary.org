/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../lib/http-errors');
const clientResources = require('../lib/client-resources');

module.exports = function (config) {
  const users = config.users;

  return {
    path: '/user/:email',
    method: 'get',
    template: 'GET-user-email.html',
    locals: {
      resources: clientResources('js/rum-diary.min.js')
    },
    authorization: require('../lib/page-authorization').IS_USER,

    handler: function (req, res, next) {
      const email = decodeURIComponent(req.params.email);

      if (email === 'new') return next();

      return users.get(email)
        .then(function (user) {
          if (! user) {
            throw httpErrors.NotFoundError();
          }
          return user;
        });
    }
  };
};
