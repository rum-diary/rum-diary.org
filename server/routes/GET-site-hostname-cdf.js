/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Promise = require('bluebird');
const db = require('../lib/db');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');
const Stats = require('fast-stats').Stats;
const ThinkStats = require('think-stats');

exports.path = '/site/:hostname/cdf';
exports.verb = 'get';

exports.handler = function(req, res) {
  console.log('handler kicked in');
  var query = getQuery(req);
  var start = moment(query.updatedAt['$gte']);
  var end = moment(query.updatedAt['$lte']);

  var statName = 'domContentLoadedEventEnd';
  if (req.query.plot) statName = req.query.plot;

  db.pageView.get(query)
    .then(function(data) {
      return filterNavigationTimingStats(data, statName);
    })
    .then(function(stats) {
      console.log('rendering', stats);
      res.render('GET-site-hostname-cdf.html', {
        baseURL: req.url.replace(/\?.*/, ''),
        cdf: stats,
        statName: statName,
        hostname: req.params.hostname,
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        resources: clientResources('rum-diary.min.js'),
        navigationTimingFields: getNavigationTimingFields()
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

function filterNavigationTimingStats(hits, stat) {
  console.log("statName", stat);
  return Promise.attempt(function() {
    var stats = new ThinkStats();

    console.log("filtering")
    hits.forEach(function(hit) {
      var value = hit.navigationTiming[stat] || NaN;
      if (isNaN(value) || value === null || value === Infinity) return;
      stats.push(value);
    });

    console.log('values pushed');
    try {
      return stats.cdf();
    } catch(e) {
      console.log('woah', String(e));
    }
  });
}
