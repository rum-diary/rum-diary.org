/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const RumDiaryEndpoint = require('rum-diary-endpoint');
const MetricsHandler = RumDiaryEndpoint.Handler;
const MetricsCollector = require('../lib/metrics-collector');

const inputValidation = require('../lib/input-validation');

module.exports = function (options) {
  options = options || {};

  var collectors = options.collectors || [ new MetricsCollector() ];

  return {
    path: '/metrics',
    method: 'post',
    cors: true,
    authorization: require('../lib/page-authorization').ANY,

    // TODO - add location, user_agent
    validation: {
      uuid: inputValidation.guid(),
      puuid: inputValidation.puuid(),
      referrer: inputValidation.referrer().optional(),
      tags: inputValidation.tags().optional(),
      returning: inputValidation.boolean(),
      navigationTiming: inputValidation.navigationTiming(),
      duration: inputValidation.duration(),
      timers: inputValidation.timers(),
      events: inputValidation.events()
    },

    handler: new MetricsHandler({
      collectors: collectors
    })
  };
};


