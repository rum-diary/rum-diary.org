/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config');
const client_resources = require('../lib/client-resources');

exports.path = /tests\/(?:index\.html)?/;
exports.method = 'get';
exports.authorization = require('../lib/page-authorization').ANY;
exports.locals = {
  resources: client_resources.testing('js/rum-diary.min.js')
};

exports.template = 'GET-test-index.html';

exports.handler = function(req, res, next) {
  if (config.get('env') !== 'test') {
    next();
    return false;
  }
};
