/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (config) {
  const authorization = config.authorization;
  const sites = config.sites;

  return {
    path: '/site/:hostname/admin',
    method: 'get',
    template: 'GET-site-hostname-admin.html',
    authorization: authorization.CAN_ADMIN_HOST,

    handler: function(req) {
      const hostname = req.params.hostname;
      const email = req.session.email;

      return sites.adminInfo(hostname)
        .then(function (adminInfo) {
          const adminUsers = adminInfo.admin;
          const readonlyUsers = adminInfo.readonly;

          return {
            root_url: req.url.replace(/\?.*/, ''),
            hostname: hostname,
            owner: adminInfo.owner,
            admin_adminInfo: adminUsers,
            readonly_adminInfo: readonlyUsers,
            is_public: adminInfo.is_public,
            isAdmin: true,
            isOwner: adminInfo.owner === email
          };
        });
    }
  };
};
