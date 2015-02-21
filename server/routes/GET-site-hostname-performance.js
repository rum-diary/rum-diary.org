/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const navigationTimingFields = require('../lib/navigation-timing');

module.exports = function (config) {
  const sites = config.sites;
  const authorization = config.authorization;
  const clientResources = config.clientResources;

  return {
    path: '/site/:hostname/performance',
    method: 'get',
    template: 'GET-site-hostname-performance.html',
    locals: {
      resources: clientResources.get('js/rum-diary.min.js')
    },
    authorization: authorization.CAN_READ_HOST,

    handler: function(req) {
      var statName = 'domContentLoadedEventEnd';
      if (req.query.plot) statName = req.query.plot;

      return Promise.all([
        sites.canAdminister(req.params.hostname, req.session.email),
        sites.performance(req.params.hostname, statName, req.start, req.end)
      ]).spread(function(isAdmin, performanceResults) {

        return {
          baseURL: req.url.replace(/\?.*/, ''),
          statName: statName,
          hostname: req.params.hostname,
          startDate: req.start.format('MMM DD'),
          endDate: req.end.format('MMM DD'),
          navigationTimingFields: navigationTimingFields,
          histogram: performanceResults.histogram,
          cdf: performanceResults.cdf,
          first_q: performanceResults.first_q,
          second_q: performanceResults.second_q,
          third_q: performanceResults.third_q,
          isAdmin: isAdmin
        };
      });
    }
  };
};

