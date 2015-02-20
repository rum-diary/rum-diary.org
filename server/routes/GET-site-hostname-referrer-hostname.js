/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promises = require('bluebird');
const clientResources = require('../lib/client-resources');

module.exports = function (config) {
  const logger = config.logger;
  const sites = config.sites;
  const authorization = config.authorization;

  return {
    path: '/site/:hostname/referrer/:referrer',
    method: 'get',
    template: 'GET-site-hostname-referrer-hostname.html',
    locals: {
      resources: clientResources('js/rum-diary.min.js')
    },
    authorization: authorization.CAN_READ_HOST,

    handler: function (req) {
      const hostname = req.params.hostname;
      const referrerHostname = req.params.referrer;
      const startDate = req.start;
      const endDate = req.end;

      return Promises.all([
        sites.canAdminister(req.params.hostname, req.session.email),
        sites.referrals(hostname, referrerHostname, startDate, endDate)
      ]).spread(function (isAdmin, results) {
        logger.info('%s: elapsed time: %s ms', req.url, results.duration);

        return {
          isAdmin: isAdmin,
          hostname: req.params.hostname,
          referrer: req.params.referrer,
          referrals: results.referrals,
          startDate: req.start,
          endDate: req.end
        };
      });
    }
  };
};

