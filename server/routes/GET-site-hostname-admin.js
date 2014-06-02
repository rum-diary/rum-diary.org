/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const siteCollection = db.site;
const accessLevels = require('../lib/access-levels');

exports.path = '/site/:hostname/admin';
exports.method = 'get';
exports.template = 'GET-site-hostname-admin.html';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.handler = function(req) {
  return siteCollection.getOne({ hostname: req.params.hostname })
      .then(function (site) {
        var adminUsers = filterAdminUsers(site.users);
        var readonlyUsers = filterReadonlyUsers(site.users);

        return {
          root_url: req.url.replace(/\?.*/, ''),
          hostname: site.hostname,
          owner: site.owner,
          admin_users: adminUsers,
          readonly_users: readonlyUsers,
          is_public: site.is_public,
          isAdmin: true,
          isOwner: site.owner === req.session.email
        };
      });
};

function filterAdminUsers(users) {
  return filterUsersByLevel(users, accessLevels.ADMIN);
}

function filterReadonlyUsers(users) {
  return filterUsersByLevel(users, accessLevels.READONLY);
}

function filterUsersByLevel(users, requiredLevel) {
  return users.filter(function (user) {
    return user.access_level === requiredLevel;
  }).map(function (user) {
    return user.email
  }).sort();
}

