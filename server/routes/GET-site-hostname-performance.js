/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Promise = require('bluebird');
const Stats = require('fast-stats').Stats;
const ThinkStats = require('think-stats');

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');
const logger = require('../lib/logger');

exports.path = '/site/:hostname/performance';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.createdAt['$gte']);
  var end = moment(query.createdAt['$lte']);

  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  var hitsData = [];

  // streams are *much* more memory efficient than one huge get.
  db.pageView.getStream(query)
    .then(function (stream) {
      stream.on('data', function (doc) {
        hitsData.push(doc);
      });

      stream.on('close', complete);
    });


  function complete() {
    var cdfData;
    var histogramData;
    var requestedStatData;

    Promise.attempt(function() {
      requestedStatData = hitsToStats(hitsData, statName);
    })
    .then(function(stats) {
      logger.info('calculating histogram');
      return filterNavigationTimingHistogram(requestedStatData);
    })
    .then(function(data) {
      logger.info('calculating cdf');
      histogramData = data;
      return filterNavigationTimingCdf(requestedStatData);
    })
    .then(function(data) {
      logger.info('calculating quartiles');
      cdfData = data;
      return reduce.mapReduce(hitsData, [
        'navigation'
      ], {
        start: start,
        end: end,
        navigation: {
          calculate: ['25', '50', '75']
        }
      });
    })
    .then(function(navigationTimingData) {
      res.render('GET-site-hostname-performance.html', {
        baseURL: req.url.replace(/\?.*/, ''),
        histogram: histogramData,
        cdf: cdfData,
        statName: statName,
        hostname: req.params.hostname,
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        resources: clientResources('rum-diary.min.js'),
        navigationTimingFields: getNavigationTimingFields(),
        first_q: navigationTimingData.navigation['25'],
        second_q: navigationTimingData.navigation['50'],
        third_q: navigationTimingData.navigation['75']
      });
      hitsData = requestedStatData =cdfData = histogramData = null;
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

function hitsToStats(hits, stat) {
  var stats = new ThinkStats();

  hits.forEach(function(hit) {
    var value = hit.navigationTiming[stat] || NaN;
    if (isNaN(value) || value === null || value === Infinity) return;
    stats.push(value);
  });

  return stats;
}

function filterNavigationTimingCdf(stats) {
  return Promise.attempt(function() {
    try {
      return stats.cdf();
    } catch(e) {
      console.log('woah', String(e));
    }
  });
}

function filterNavigationTimingHistogram(stats) {
  return Promise.attempt(function() {
    var twentyFifthPercentile = stats.percentile(25);
    var startIndex = stats.percentileIndex(25);

    var seventyFifthPercentile = stats.percentile(75);
    var endIndex = stats.percentileIndex(75);

    var buckets = Math.min(endIndex - startIndex, 75) || 1;

    // slice's endIndex is exclusive, add one to include the endIndex.
    var iqrHits = stats.sorted().slice(startIndex, endIndex + 1);

    var bucketed = new ThinkStats();
    bucketed.push(iqrHits);

    var values = [];
    var d = bucketed.bucket(buckets);
    d.forEach(function(bucket) {
      for (var i = 0; i < bucket.count; ++i) {
        values.push(bucket.bucket);
      }
    });

    return values;
  });
}

