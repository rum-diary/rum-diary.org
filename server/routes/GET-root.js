/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.verb = 'get';
exports.path = '/';
exports.authorization = require('../lib/page-authorization').ANY;
exports.template = 'GET-root.html';

exports.handler = function(req, res) {
  return {};
};
