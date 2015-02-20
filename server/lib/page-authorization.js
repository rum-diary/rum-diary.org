/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('./http-errors');

module.exports = function (sites) {
  return {
    ANY: function () {
      // anything goes.
    },

   /**
     * User must be authenticated to view page
     */
    AUTHENTICATED: function (req) {
      if (! req.session.email) throw httpErrors.UnauthorizedError();
    },

    /**
     * User must not be authenticated to view page
     */
    NOT_AUTHENTICATED: function (req) {
      if (req.session.email) throw httpErrors.UnauthorizedError();
    },

    /**
     * User in email param must be the same as session email
     */
    IS_USER: function (req) {
      var email = decodeURIComponent(req.params.email);
      if (email === 'new') return;

      if (! req.session.email) throw httpErrors.UnauthorizedError();
      else if (req.session.email !== email) throw httpErrors.ForbiddenError();
    },

    /**
     * User must be authorized to read host to view page.
     */
    CAN_READ_HOST: function (req) {
      if (! req.session.email) throw httpErrors.UnauthorizedError();

      return sites.canView(req.params.hostname, req.session.email)
        .then(function (isAuthorized) {
          if (! isAuthorized) throw httpErrors.ForbiddenError();
        });
    },

    /**
     * User must be authorized to administrate the host to view a page.
     */
    CAN_ADMIN_HOST: function (req) {
      if (! req.session.email) throw httpErrors.UnauthorizedError();

      return sites.canAdminister(req.params.hostname, req.session.email)
        .then(function (isAuthorized) {
          if (! isAuthorized) throw httpErrors.ForbiddenError();
        });
    },

    IS_OWNER_HOST: function (req) {
      if (! req.session.email) throw httpErrors.UnauthorizedError();

      return sites.isOwner(req.params.hostname, req.session.email)
        .then(function (isAuthorized) {
          if (! isAuthorized) throw httpErrors.ForbiddenError();
        });
    }
  };

};

