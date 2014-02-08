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
  console.log('handler kicked in');
  var query = getQuery(req);
  var start = moment(query.updatedAt['$gte']);
  var end = moment(query.updatedAt['$lte']);

  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  var hitsData;
  var cdfData;
  var histogramData;
  var navigationTimingData;
  db.pageView.get(query)
    .then(function(data) {
      logger.info('calculating histogram');
      hitsData = data;
      return filterNavigationTimingHistogram(hitsData, statName);
    })
    .then(function(data) {
      logger.info('calculating cdf');
      histogramData = data;
      return filterNavigationTimingCdf(hitsData, statName);
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
    .then(function(data) {
      navigationTimingData = data;

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
    })
    .then(null, function(err) {
      return res.send(500);
    });
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

function filterNavigationTimingCdf(hits, stat) {
  console.log('statName', stat);
  return Promise.attempt(function() {
    var stats = new ThinkStats();

    hits.forEach(function(hit) {
      var value = hit.navigationTiming[stat] || NaN;
      if (isNaN(value) || value === null || value === Infinity) return;
      stats.push(value);
    });

    try {
      return stats.cdf();
    } catch(e) {
      console.log('woah', String(e));
    }
  });
}

function filterNavigationTimingHistogram(hits, stat) {
  console.log('statName', stat);
  return Promise.attempt(function() {
    var stats = new Stats();

    hits.forEach(function(hit) {
      var value = hit.navigationTiming[stat] || NaN;
      if (isNaN(value) || value === null || value === Infinity) return;
      stats.push(value);
    });

    var iqr = stats.iqr();
    if (iqr.length === 0) return [];
    var range = iqr.range();

    var start = range[0] || 0;
    var end = range[1] || (stats.length - 1);

    var buckets = Math.min(iqr.length, 75) || 1;
    var precision = Math.ceil((end - start) / buckets);
    var bucketed = new Stats({ bucket_precision: precision });

    hits.forEach(function(hit) {
      var value = hit.navigationTiming[stat] || NaN;
      if (isNaN(value) || value === null || value === Infinity) return;
      if (start <= value && value <= end) {
        bucketed.push(value);
      }
    });

    var values = [];
    var d = bucketed.distribution();
    d.forEach(function(bucket) {
      for (var i = 0; i < bucket.count; ++i) {
        values.push(bucket.bucket);
      }
    });

    return values;
  });
}

