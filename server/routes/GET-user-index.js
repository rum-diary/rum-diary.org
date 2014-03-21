/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');

exports.path = '/user';
exports.verb = 'get';

exports.handler = function (req, res) {
  return db.user.get({})
                .then(function (models) {
                  res.json(models);
                });
};
