/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../db');
const logger = require('../logger');
const reduce = require('../reduce');

exports.path = /\/site\/([\w\d][\w\d-]*(?:\.[\w\d][\w\d-]*)?)\/path\/([\w\d-]+(?:\/[\w\d-]+)*\/?)$/;
exports.verb = 'get';

const client_resources = require('../client-resources');

exports.handler = function(req, res) {
  var hostname = req.params[0];
  var path = req.params[1] || 'index';
  logger.info('get information for %s/%s', hostname, path);

  var searchBy = {
    hostname: hostname,
    path: path
  };

  if ( ! /^\//.test(searchBy.path)) {
    searchBy.path = "/" + searchBy.path;
  }

  db.get(searchBy, function(err, data) {
    if (err) return res.send(500);

    var pageHitsPerDay = reduce.pageHitsPerDay(data);
    var pageHitsPerPage = reduce.pageHitsPerPage(data);
    var pageHitsPerPageSorted = sortPageHitsPerPage(pageHitsPerPage);

    // parallelize all of the calculating!
    reduce.findReferrers(data, function(err, referrerStats) {
      reduce.findNavigationTimingStats(data,
        ['range', 'median'],
        function(err, medianStats) {
        res.render('GET-site-hostname-path.html', {
          root_url: req.url,
          hostname: hostname,
          path: path,
          resources: client_resources('rum-diary.min.js'),
          pageHitsPerPage: pageHitsPerPageSorted,
          pageHitsPerDay: pageHitsPerDay.__all,
          median: medianStats.median,
          range: JSON.stringify(medianStats.range),
          referrers: referrerStats.by_count
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
