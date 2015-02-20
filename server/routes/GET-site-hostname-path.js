/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientResources = require('../lib/client-resources');

module.exports = function (config) {
  const pages = config.sites.pages;
  const authorization = config.authorization;

  return {
    method: 'get',
    path: /\/site\/([\w\d][\w\d\-]*(?:\.[\w\d][\w\d\-]*)*)\/path\/(.*)?$/,

    // Convert from the above regexp to named params
    setParams: function (req) {
      req.params.hostname = req.params[0];
      req.params.path = req.params[1] || 'index';

      if ( ! /^\//.test(req.params.path)) {
        req.params.path = '/' + req.params.path;
      }
    },

    template: 'GET-site-hostname-path.html',
    locals: {
      resources: clientResources('js/rum-diary.min.js')
    },
    authorization: authorization.CAN_READ_HOST,

    handler: function(req) {
      const hostname = req.params.hostname;
      const path = req.params.path;
      const startDate = req.start;
      const endDate = req.end;

      return pages.traffic(hostname, path, startDate, endDate)
        .then(function (results) {
        return {
          root_url: req.url.replace(/\?.*/, ''),
          hostname: hostname,
          path: path,
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
            repeat: results.hits.repeat,
            exitRate: results.hits.exitRate,
            bounceRate: results.hits.bounceRate
          },
          medianReadTime: results.medianReadTime,
          internalTransfer: {
            from: results.internalTransfer.from
          }
        };
      });
    }
  };
};
