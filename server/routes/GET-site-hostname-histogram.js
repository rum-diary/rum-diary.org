/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const db = require('../lib/db');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');

exports.path = '/site/:hostname/histogram';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.updatedAt['$gte']);
  var end = moment(query.updatedAt['$lte']);

  var statName = 'domContentLoadedEventEnd';
  if (req.query.histogram) statName = req.query.histogram;

  db.get(query)
    .then(function(data) {
      return filterNavigationTimingStats(data, statName);
    })
    .then(function(stats) {
      res.render('GET-site-hostname-histogram.html', {
        histogram: stats,
        statName: statName,
        hostname: req.params.hostname,
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        resources: clientResources('rum-diary.min.js')
      });
    })
    .then(null, function(err) {
      return res.send(500);
    });
};

function filterNavigationTimingStats(hits, stat) {
  return Promise.attempt(function() {
    var stats = [];

    hits.forEach(function(hit) {
      var value = hit.navigationTiming[stat] || null;
      if (isNaN(value) || value === null) return;
      stats.push(value);
    });

    var nintyPercent = Math.ceil(stats.length * 0.9);

    return stats.slice(0, nintyPercent);
  });
}
