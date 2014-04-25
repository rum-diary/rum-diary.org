/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The welcome page shows the user how to add the JS snippet to their site.

exports.verb = 'get';
exports.path = '/welcome';
exports.authorization = require('../lib/page-authorization').AUTHENTICATED;
exports.template = 'GET-welcome.html';

exports.handler = function(req, res) {
  const hostname = req.session.hostname;
  delete req.session.hostname;

  const name = req.session.name;
  delete req.session.name;

  const isNewSite = req.session.isNewSite;
  delete req.session.isNewSite;

  const canViewExistingSite = req.session.canViewExistingSite;
  delete req.session.canViewExistingSite;

  return {
    email: req.session.email,
    name: name,
    hostname: hostname,
    rum_diary_hostname: req.host,
    is_new_site: isNewSite,
    has_access: canViewExistingSite,
  };
};
