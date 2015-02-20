/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const p = require('bluebird');
const clientResources = require('../lib/client-resources');

module.exports = function (config) {
  const sites = config.sites;
  const authorization = config.authorization;

  return {
    path: '/site/:hostname/demographics',
    method: 'get',
    template: 'GET-site-hostname-demographics.html',
    locals: {
      resources: clientResources('js/rum-diary.min.js')
    },
    authorization: authorization.CAN_READ_HOST,

    handler: function(req) {
      const email = req.session.email;
      const hostname = req.params.hostname;
      const startDate = req.start;
      const endDate = req.end;

      return p.all([
        sites.canAdminister(hostname, email),
        sites.demographics(hostname, startDate, endDate)
      ]).spread(function(isAdmin, demographicsResults) {

        return {
          isAdmin: isAdmin,
          hostname: hostname,
          startDate: startDate.format('MMM DD'),
          endDate: endDate.format('MMM DD'),
          browsers: demographicsResults.browsers,
          os: demographicsResults.os,
          os_form: demographicsResults.os_form
        };
      });
    }
  };
};

