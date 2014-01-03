/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.path = '/';
exports.verb = 'get';

const client_resources = require('../client-resources');

exports.handler = function(req, res) {
  res.render('GET-root.html');
};
