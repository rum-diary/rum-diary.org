/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a site.

const db = require('../lib/db');
const siteCollection = db.site;

exports.path = '/site/:hostname';
exports.verb = 'delete';
exports.authorization = require('../lib/page-authorization').IS_OWNER_HOST;

exports.handler = function (req, res) {
  var hostname = req.params.hostname;

  return siteCollection.findOneAndDelete({ hostname: hostname })
    .then(function () {
      res.redirect('/user');
    });
};
