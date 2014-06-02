/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('../logger');
const httpErrors = require('../http-errors');


module.exports = function (err, req, res, next) {
  if (! err) return next();

  if (httpErrors.is(err, httpErrors.UnauthorizedError)) {
    // user is not authenticated, redirect them to the signin page.
    req.session.redirectTo = encodeURIComponent(req.url);
    res.redirect(307, '/user');
    return;
  } else if (err.httpError) {
    var httpStatusCode = err.httpError;
    logger.error('%s(%s): %s', req.url, httpStatusCode, String(err));
    res.send(httpStatusCode, err.message);
    return;
  }

  next(err);
};

