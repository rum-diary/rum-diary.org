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
  exports.findNavigationTimingStats(hitsForHost, ['median'], function(err, stats) {
    if (err) return done(err);

    done(null, stats.median);
  });
};

exports.findNavigationTimingStats = function (hitsForHost, statsToFind, options, done) {
  if ( ! done && typeof options === "function") {
    done = options;
    options = {};
  }

  getNavigationTimingStats(hitsForHost, options, function(err, stats) {
    if (err) return done(err);

    var returnedStats = {};
    for (var key in stats) {
      statsToFind.forEach(function(statName) {
        if ( ! (statName in returnedStats)) returnedStats[statName] = {};

        returnedStats[statName][key] = stats[key][statName]();
      });
    }

    done(null, returnedStats);
  });
};

function createStat(options) {
  return new Stats(options);
}

function getNavigationTimingStats (hitsForHost, options, done) {
  // For descriptions, see:
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#processing-model

  // prompt for unload
  var stats = {
    navigationStart: createStat(options),

    // redirect - only visible if redirecting from the same domain.
    redirectStart: createStat(options),
    redirectEnd: createStat(options),
    redirectDuration: createStat(options),

    // App cache
    fetchStart: createStat(options),

    // DNS - will be the same as fetchStart if DNS is already resolved.
    domainLookupStart: createStat(options),
    domainLookupEnd: createStat(options),
    domainLookupDuration: createStat(options),

    // TCP - will be the same as domainLookupDuration if reusing a connection.
    connectStart: createStat(options),
    secureConnectionStart: createStat(options),
    connectEnd: createStat(options),
    connectDuration: createStat(options),

    // request & response
    requestStart: createStat(options),
    responseStart: createStat(options),
    responseEnd: createStat(options),
    requestResponseDuration: createStat(options),

    // unload previous page - only valid previous page was on the same domain.
    unloadEventStart: createStat(options),
    unloadEventEnd: createStat(options),
    unloadEventDuration: createStat(options),

    // processing
    domLoading: createStat(options),
    domInteractive: createStat(options),
    domContentLoadedEventStart: createStat(options),
    domContentLoadedEventEnd: createStat(options),
    domContentLoadedEventDuration: createStat(options),
    domComplete: createStat(options),

    // load
    loadEventStart: createStat(options),
    loadEventEnd: createStat(options),
    loadEventDuration: createStat(options),
    processingDuration: createStat(options)
  };

  hitsForHost.forEach(function(hit) {
    var navTiming = hit.navigationTiming;

    for (var key in navTiming) {
      if (stats.hasOwnProperty(key)) stats[key].push(navTiming[key]);
    }

    stats.redirectDuration.push(
              navTiming.redirectEnd - navTiming.redirectStart);

    stats.domainLookupDuration.push(
              navTiming.domainLookupEnd - navTiming.domainLookupStart);

    stats.connectDuration.push(
              navTiming.connectEnd - navTiming.connectStart);

    stats.requestResponseDuration.push(
              navTiming.responseEnd - navTiming.requestStart);

    stats.unloadEventDuration.push(
              navTiming.unloadEventEnd - navTiming.unloadEventStart);

    stats.domContentLoadedEventDuration.push(
              navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);

    stats.loadEventDuration.push(
              navTiming.loadEventEnd - navTiming.loadEventStart);

    stats.processingDuration.push(
              navTiming.loadEventEnd - navTiming.domLoading);
  });

  done(null, stats);
}
