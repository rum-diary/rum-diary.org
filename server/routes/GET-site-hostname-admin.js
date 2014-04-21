/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('../lib/logger');
const db = require('../lib/db');
const clientResources = require('../lib/client-resources');
const httpErrors = require('../lib/http-errors');

exports.path = '/site/:hostname/admin';
exports.verb = 'get';
exports.template = 'GET-site-hostname-admin.html';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.handler = function(req) {

  return db.site.getOne({ hostname: req.params.hostname })
      .then(function (site) {
        return {
          root_url: req.url.replace(/\?.*/, ''),
          hostname: site.hostname,
          admin_users: site.admin_users,
          readonly_users: site.readonly_users,
          is_public: site.is_public
        };
      });
};

