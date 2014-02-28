/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Promise = require('bluebird');

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');
const logger = require('../lib/logger');

exports.path = '/site/:hostname/performance';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.createdAt.$gte);
  var end = moment(query.createdAt.$lte);

  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  var reduceStream = new reduce.StreamReduce({
    which: ['navigation', 'navigation-histogram', 'navigation-cdf'],
    start: start,
    end: end,
    navigation: {
      calculate: ['25', '50', '75']
    },
    'navigation-histogram': {
      statName: statName
    },
    'navigation-cdf': {
      statName: statName
    }
  });

  // streams are *much* more memory efficient than one huge get.
  db.pageView.getStream(query)
    .then(function (stream) {
      stream.on('data', reduceStream.write.bind(reduceStream));

      stream.on('close', complete);
    });


  function complete() {
    Promise.attempt(function() {
      logger.info('calculating navigatin timing data');
      var results = reduceStream.result();

      res.render('GET-site-hostname-performance.html', {
        baseURL: req.url.replace(/\?.*/, ''),
        histogram: results['navigation-histogram'],
        cdf: results['navigation-cdf'],
        statName: statName,
        hostname: req.params.hostname,
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        resources: clientResources('rum-diary.min.js'),
        navigationTimingFields: getNavigationTimingFields(),
        first_q: results.navigation['25'],
        second_q: results.navigation['50'],
        third_q: results.navigation['75']
      });

      reduceStream.end();
      results = null;
    })
    .then(null, function(err) {
      res.send(500);
      logger.error('error! %s', String(err));
    });
  }

};

function getNavigationTimingFields() {
  return Object.keys({
    'navigationStart': Number,
    'unloadEventStart': Number,
    'unloadEventEnd': Number,
    'redirectStart': Number,
    'redirectEnd': Number,
    'fetchStart': Number,
    'domainLookupStart': Number,
    'domainLookupEnd': Number,
    'connectStart': Number,
    'connectEnd': Number,
    'secureConnectionStart': Number,
    'requestStart': Number,
    'responseStart': Number,
    'responseEnd': Number,
    'domLoading': Number,
    'domInteractive': Number,
    'domContentLoadedEventStart': Number,
    'domContentLoadedEventEnd': Number,
    'domComplete': Number,
    'loadEventStart': Number,
    'loadEventEnd': Number
  });
}

