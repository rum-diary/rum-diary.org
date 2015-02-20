/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const p = require('bluebird');
const clientResources = require('../lib/client-resources');

module.exports = function (config) {
  const sites = config.sites;
  const logger = config.logger;
  const authorization = config.authorization;

  return {
    path: '/site/:hostname',
    method: 'get',
    template: 'GET-site-hostname.html',
    locals: {
      resources: clientResources('js/rum-diary.min.js')
    },
    authorization: authorization.CAN_READ_HOST,

    handler: function (req) {
      const email = req.session.email;
      const hostname = req.params.hostname;
      const startDate = req.start;
      const endDate = req.end;

      return p.all([
        sites.canAdminister(hostname, email),
        sites.traffic(hostname, startDate, endDate)
      ]).spread(function (isAdmin, results) {
        logger.info('%s: elapsed time: %s ms', req.url, results.duration);

        return {
          root_url: req.url.replace(/\?.*/, ''),
          isAdmin: isAdmin,
          hostname: hostname,
          startDate: startDate,
          endDate: endDate,
          pageHitsPerPage: results.pageHitsPerPage,
          pageHitsPerDay: results.pageHitsPerDay,
          referrers: results.referrers,
          hits: {
            total: results.hits.total,
            period: results.hits.period,
            today: results.hits.today,
            unique: results.hits.unique,
            repeat: results.hits.repeat
          },
          annotations: results.annotations
        };
      });
    }
  };
};

