/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.path = '/site/:hostname';
exports.verb = 'get';

const client_resources = require('../client-resources');

exports.handler = function(req, res) {
  res.render('GET-site-hostname.html', {
    hostname: req.params.hostname,
    resources: client_resources('rum-diary.min.js')
  });
};
