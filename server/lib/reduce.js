/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Stats = require('fast-stats').Stats;

function getPathDateInfo(returnedData, path, date) {
  if ( ! (path in returnedData)) {
    returnedData[path] = [];
    for (var i = 0; i < 30; ++i) {
      returnedData[path][i] = {
        hits: 0,
        date: moment().subtract('days', i).format('YYYY-MM-DD')
      };
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

exports.findMedianNavigationTimes = function (hitsForHost, done) {
  getNavigationTimingStats(hitsForHost, function(err, stats) {
    if (err) return done(err);

    var medians = {};
    for (var key in stats) {
      medians[key] = stats[key].median();
    }

    done(null, medians);
  });
};

function getNavigationTimingStats (hitsForHost, done) {
  // request & response timings
  var requestStart = new Stats();
  var responseStart = new Stats();
  var responseEnd = new Stats();
  var requestResponseDuration = new Stats();

  // processing timings
  var domLoading = new Stats();
  var domInteractive = new Stats();
  var domContentLoadedEventStart = new Stats();
  var domContentLoadedEventEnd = new Stats();
  var domContentLoadedEventDuration = new Stats();
  var domComplete = new Stats();
  var processingDuration = new Stats();

  // load timings
  var loadEventStart = new Stats();
  var loadEventEnd = new Stats();
  var loadEventDuration = new Stats();

  hitsForHost.forEach(function(hit) {
    var navTiming = hit.navigationTiming;

    requestStart.push(navTiming.requestStart);
    responseStart.push(navTiming.responseStart);
    responseEnd.push(navTiming.responseEnd);
    requestResponseDuration.push(navTiming.responseEnd - navTiming.requestStart);

    domLoading.push(navTiming.domLoading);
    domInteractive.push(navTiming.domInteractive);
    domContentLoadedEventStart.push(navTiming.domContentLoadedEventStart);
    domContentLoadedEventEnd.push(navTiming.domContentLoadedEventEnd);
    domContentLoadedEventDuration.push(navTiming.domContentLoadedEventEnd
                                      - navTiming.domContentLoadedEventStart);
    domComplete.push(navTiming.domComplete);
    processingDuration.push(navTiming.domComplete - navTiming.domLoading);

    loadEventStart.push(navTiming.loadEventStart);
    loadEventEnd.push(navTiming.loadEventEnd);
    loadEventDuration.push(navTiming.loadEventEnd - navTiming.loadEventStart);
  });

  done(null, {
    requestStart: requestStart,
    responseStart: responseStart,
    responseEnd: responseEnd,
    requestResponseDuration: requestResponseDuration,

    domLoading: domLoading,
    domInteractive: domInteractive,
    domContentLoadedEventStart: domContentLoadedEventStart,
    domContentLoadedEventEnd: domContentLoadedEventEnd,
    domContentLoadedEventDuration: domContentLoadedEventDuration,
    domComplete: domComplete,
    processingDuration: processingDuration,

    loadEventStart: loadEventStart,
    loadEventEnd: loadEventEnd,
    loadEventDuration: loadEventDuration
  });
}
