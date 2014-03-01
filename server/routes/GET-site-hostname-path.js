/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const db = require('../lib/db');
const logger = require('../lib/logger');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');


exports.path = /\/site\/([\w\d][\w\d-]*(?:\.[\w\d][\w\d-]*)*)\/path\/(.*)?$/;
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.createdAt['$gte']);
  var end = moment(query.createdAt['$lte']);

  var hostname = req.params[0];
  var path = req.params[1] || 'index';
  logger.info('get information for %s/%s', hostname, path);

  if ( ! /^\//.test(path)) {
    path = '/' + path;
  }

  query.hostname = hostname;
  query.path = path;

  var reductionStart;
  var totalHits = 0;

  db.pageView.get(query).then(function(hits) {
    reductionStart = new Date();

    return reduce.mapReduce(hits, [
      'hits_per_day',
      'hits_per_page',
      'referrers',
      'unique',
      'returning',
      'read-time'
    ], {
      start: start,
      end: end
    });
  }).then(function(results) {
    var pageHitsPerPageSorted = sortPageHitsPerPage(results.hits_per_page).slice(0, 20);

    var reductionEnd = new Date();
    var reductionDuration = reductionEnd.getTime() - reductionStart.getTime();
    logger.info('reduction time for %s: %s ms', req.url, reductionDuration);

    res.render('GET-site-hostname-path.html', {
      root_url: req.url.replace(/\?.*/, ''),
      hostname: hostname,
      path: path,
      resources: clientResources('rum-diary.min.js'),
      pageHitsPerPage: pageHitsPerPageSorted,
      pageHitsPerDay: results.hits_per_day.__all,
      referrers: results.referrers.by_count.slice(0, 20),
      startDate: start.format('MMM DD'),
      endDate: end.format('MMM DD'),
      hits: {
        total: 'N/A',//totalHits,
        period: pageHitsPerPageSorted[0].hits,
        today: results.hits_per_day.__all[results.hits_per_day.__all.length - 1].hits,
        unique: results.unique,
        repeat: results.returning
      },
      medianReadTime: msToHoursMinsSeconds(results['read-time'])
    });
  }, function(err) {
    res.send(500);
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

function msToHoursMinsSeconds(ms) {
  var seconds = ((ms || 0) / 1000) << 0;

  var hours = (seconds / 3600) << 0;
  var minutes = ((seconds - hours * 3600) / 60) << 0;
  seconds = (seconds % 60);

  return {
    hours: padLeft(hours, 0, 2),
    minutes: padLeft(minutes, 0, 2),
    seconds: padLeft(seconds, 0, 2)
  };
}

function padLeft(numToPad, padWith, length) {
  var padded = '' + numToPad;

  while(padded.length < length) {
    padded = padWith + padded;
  }

  return padded;
}

