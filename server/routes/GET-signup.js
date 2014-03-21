/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientResources = require('../lib/client-resources');

exports.path = '/signup';
exports.verb = 'get';
exports.template = 'GET-signup.html';
exports['js-resources'] = clientResources('signup.min.js');

exports.handler = function() {
  return {};
};
