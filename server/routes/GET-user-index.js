/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Placeholder to sign a user in.

const clientResources = require('../lib/client-resources');

exports.path = '/user';
exports.verb = 'get';
exports.template = 'GET-user-index.html';
exports['js-resources'] = clientResources('js/signin.min.js');
exports.authorization = require('../lib/page-authorization').ANY;

exports.handler = function (req, res) {
  return {};
};
