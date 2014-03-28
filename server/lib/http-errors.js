/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * HTTP errors. List of errors:
 *  https://github.com/mercmobily/HTTPErrors
 *
 * Useful in routes to send an error as a response.
 *
 * e.g.:
 *
 * const httpErrors = require('./lib/http-errors');
 *
 * routerHandler(req, res, next) {
 *   if (! isUserAuthenticated(req)) {
 *     return httpErrors.UnauthorizedError();
 *   }
 * }
 */

const httpErrors = require('allhttperrors');

Object.keys(httpErrors).forEach(function(errorName) {
  exports[errorName] = function(message) {
    return new httpErrors[errorName](message);
  };
});
