/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');

function getPathDateInfo(returnedData, path, date) {
  if ( ! (path in returnedData)) {
    returnedData[path] = [];
    for (i = 0; i < 30; ++i) {
      returnedData[path][i] = {
        hits: 0,
        date: moment().subtract('days', i).format('YYYY-MM-DD')
      }
    }
  }

  var daysAgo = moment().diff(date, 'days');

  return returnedData[path][daysAgo];
}

function incrementDailyPageHit(returnedData, path, date) {
  var pathDateInfo = getPathDateInfo(returnedData, path, date);
  pathDateInfo.hits++;
}

exports.pageHitsPerDay = function (hitsForHost) {
  var hitsPerDay = {};

  hitsForHost.forEach(function (item) {
    var date = moment(item.createdAt);

    if (item.path)
      incrementDailyPageHit(hitsPerDay, item.path, date);

    incrementDailyPageHit(hitsPerDay, '__all', date);
  });

  return hitsPerDay;
};

exports.pageHitsPerPage = function (hitsForHost) {
  var hitsPerPage = {
    __all: 0
  };

  hitsForHost.forEach(function (item) {
    hitsPerPage.__all++;

    var path = item.path;
    if ( ! path) return;

    if ( ! (path in hitsPerPage)) hitsPerPage[path] = 0;

    hitsPerPage[path]++;
  });

  return hitsPerPage;
};

exports.findLoadTimes = function (hitsForHost) {
  var loadTimes = hitsForHost.map(function (item) {
    var loadTime;
    try {
      var navigationTiming = item.navigationTiming;
      loadTime = navigationTiming.loadEventEnd
                    - navigationTiming.navigationStart;
    } catch(e) {
      return NaN;
    }
    return loadTime;
  });
  return loadTimes;
};

exports.findAverageLoadTime = function (hitsForHost) {
  var count = 0;
  var total = exports.findLoadTimes(hitsForHost).reduce(function (prev, curr) {
    if (isNaN(curr)) return prev;
    count++;
    return prev + curr;
  }, 0);

  if (count) return total / count;
  return 0;
};

