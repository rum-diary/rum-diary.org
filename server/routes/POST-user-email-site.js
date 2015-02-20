/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const sites = config.sites;
  const users = config.users;

  return {
    path: '/user/:email/site',
    method: 'post',
    authorization: require('../lib/page-authorization').IS_USER,

    validation: {
      _csrf: inputValidation.csrf(),
      hostname: inputValidation.hostname()
    },

    handler: function (req, res) {
      var email = req.params.email;
      var hostname = req.body.hostname;

      return users.exists(email)
        .then(function (exists) {
          if (! exists) {
            throw httpErrors.NotFoundError();
          }

          return sites.create(hostname, email)
            .then(function() {
              return true;
            }, function (err) {
              // if the site already exists, inform the user, but do not fail.
              if (err.message === 'already exists') return false;

              // all other errors fail.
              throw err;
            });
        })
        .then(function (isCreated) {
          if (isCreated) {
            // go back to the original page.
            res.redirect(req.get('referrer'));
          } else {
            // site already exists, cannot create as owner, and cannot self add.
          }
        });
    }
  };
};
