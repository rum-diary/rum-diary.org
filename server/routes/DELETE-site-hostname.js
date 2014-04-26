/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Delete a site.

const db = require('../lib/db');
const siteCollection = db.site;
const httpErrors = require('../lib/http-errors');

exports.path = '/site/:hostname';
exports.verb = 'delete';
exports.authorization = require('../lib/page-authorization').IS_OWNER_HOST;

exports.handler = function (req, res) {
  var hostname = req.params.hostname;
  var verificationHostname = req.body.hostname;

  // uh oh, verification hostname is not the same as the real hostname.
  if (hostname !== verificationHostname) {
    throw new httpErrors.ForbiddenError();
  }

  return siteCollection.findOneAndDelete({ hostname: hostname })
    .then(function () {
      res.redirect('/site');
    });
};
