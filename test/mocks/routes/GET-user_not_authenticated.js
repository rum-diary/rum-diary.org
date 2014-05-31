/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const httpErrors = require('../../../server/lib/http-errors');

exports.path = '/user_not_authenticated';
exports.verb = 'get';
exports.template = 'template';

exports.authorization = function () {
  throw httpErrors.UnauthorizedError();
};

exports.handler = function() {
  return {};
};

