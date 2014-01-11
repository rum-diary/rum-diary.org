/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');

exports.path = '/site/:hostname';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query['$gte']);
  var end = moment(query['$lte']);

  db.get(query, function(err, data) {
    if (err) return res.send(500);

    var pageHitsPerDay = reduce.pageHitsPerDay(data, start, end);
    var pageHitsPerPage = reduce.pageHitsPerPage(data);
    var pageHitsPerPageSorted = sortPageHitsPerPage(pageHitsPerPage).slice(0, 20);

    // parallelize all of the calculating!
    reduce.findReferrers(data, function(err, referrerStats) {
      reduce.findNavigationTimingStats(data,
        ['range', 'median'],
        function(err, medianStats) {
        res.render('GET-site-hostname.html', {
          root_url: req.url.replace(/\?.*/, ''),
          hostname: req.params.hostname,
          resources: clientResources('rum-diary.min.js'),
          pageHitsPerPage: pageHitsPerPageSorted,
          pageHitsPerDay: pageHitsPerDay.__all,
          median: medianStats.median,
          range: JSON.stringify(medianStats.range),
          referrers: referrerStats.by_count.slice(0, 20),
          startDate: start.format('MMM DD'),
          endDate: end.format('MMM DD')
        });
      });
    });
  });

};

function sortPageHitsPerPage(pageHitsPerPage) {
  var sorted = Object.keys(pageHitsPerPage).map(function(key) {
    return {
      page: key,
      hits: pageHitsPerPage[key]
    };
  }).sort(function(a, b) {
    return b.hits - a.hits;
  });

  return sorted;
}
