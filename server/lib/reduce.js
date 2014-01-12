/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Stats = require('fast-stats').Stats;
const url = require('url');
const SortedArray = require('sarray');

function ensurePageInfo(returnedData, page, startDate, endDate) {
  if ( ! (page in returnedData)) {
    var numDays = moment(endDate).diff(startDate, 'days');
    returnedData[page] = [];
    // <= to include both the start and end date
    for (var i = 0; i <= numDays; ++i) {
      returnedData[page][i] = {
        hits: 0,
        date: moment(endDate).subtract('days', i).format('YYYY-MM-DD')
      };
    }
  }

  return returnedData;
}

function getPageDateInfo(returnedData, page, startDate, date) {
  var index = moment(date).diff(startDate, 'days');
  return returnedData[page][index];
}

function incrementDailyPageHit(returnedData, page, date) {
  var pageDateInfo = getPageDateInfo(returnedData, page, date);
  if ( ! pageDateInfo) return new Error('invalid date range');
  pageDateInfo.hits++;
}

function earliestDate(data, dateName) {
  return data.reduce(function(prevStart, item) {
            var currStart = moment(item[dateName]);
            if ( ! prevStart) return currStart;
            if (currStart.isBefore(prevStart)) return currStart;
            return prevStart;
          }, null);
}

function latestDate(data, dateName) {
  return data.reduce(function(prevEnd, item) {
            var currEnd = moment(item[dateName]);
            if ( ! prevEnd) return currEnd;
            if (currEnd.isAfter(prevEnd)) return currEnd;
            return prevEnd;
          }, null);
}

/**
 * Find the number of page hits per day per page. Returns a dictionary that is
 *    keyed by page path. Each path contains an array of objects, each object
 *    contains a date and number of hits. The '__all' path contains aggregate
 *    data of all paths.
 *
 *    example:
 * {
 *    __all: [{ date: '2013-12-30', hits: 4 }, { date: '2013-12-31', hits: 3 }, ...
 *    '/': [{ date: '2013-12-30', hits: 2 }, { date: '2013-12-31', hits: 3 }, ...
 *    '/about': [{ date: '2013-12-30', hits: 2 }, { date: '2013-12-31', hits: 0 }, ...
 * }
 *
 * @method pageHitsPerDay
 * @param [array] hits - hit data - assumed to be from a single host
 * @param [date] (startDate) - start date of data. If not given, searches
 *           through data for earliest date
 * @param [date] (endDate) - end date of data. If not given, searches
 *           through data for last date
 */
exports.pageHitsPerDay = function (hits, options, done) {
  if (typeof options === "function" && !done) {
    done = options;
    options = {};
  }

  exports.mapReduce(hits, ['hits_per_day'], options, function(err, data) {
    if (err) return done(err);
    done(null, data.hits_per_day);
  });
};

function updatePageHit(hitsPerDay, options, hit) {
  var date = moment(hit.createdAt);

  if (hit.path) {
    ensurePageInfo(hitsPerDay, hit.path, options.start, options.end);
    incrementDailyPageHit(hitsPerDay, hit.path, date);
  }

  incrementDailyPageHit(hitsPerDay, '__all', date);
}

exports.pageHitsPerPage = function (hits, done) {
  exports.mapReduce(hits, ['hits_per_page'], function(err, data) {
    if (err) return done(err);
    done(null, data.hits_per_page);
  });
};

exports.findLoadTimes = function (hits) {
  var loadTimes = hits.map(function (item) {
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

exports.findAverageLoadTime = function (hits) {
  var count = 0;
  var total = exports.findLoadTimes(hits).reduce(function (prev, curr) {
    if (isNaN(curr)) return prev;
    count++;
    return prev + curr;
  }, 0);

  if (count) return total / count;
  return 0;
};

exports.findMedianNavigationTimes = function (hits, done) {
  exports.findNavigationTimingStats(hits, ['median'], function(err, stats) {
    if (err) return done(err);

    done(null, stats.median);
  });
};

exports.calculateStats = function(values, statsToFind, done) {
  var returnedStats = {};
  for (var key in values) {
    statsToFind.forEach(function(statName) {
      if ( ! (statName in returnedStats)) returnedStats[statName] = {};

      returnedStats[statName][key] = values[key][statName]();
    });
  }

  done(null, returnedStats);
};

exports.findNavigationTimingStats = function (hits, statsToFind, options, done) {
  if ( ! done && typeof options === 'function') {
    done = options;
    options = {};
  }

  if ( ! options.navigation) options.navigation = {};
  options.navigation.calculate = statsToFind;
  getNavigationTimingStats(hits, options, done);
};

exports.findReferrers = function (hits, done) {
  exports.mapReduce(hits, ['referrers'], function(err, data) {
    done(null, data.referrers);
  });
};

function countReferrersByHostname (hits) {
  var countByHostname = {};

  hits.forEach(function(hit) {
    if ( ! hit.referrer) return;

    var parsed;
    try {
      parsed = url.parse(hit.referrer);
    } catch(e) {
      return;
    }

    var hostname = parsed.hostname;
    if ( ! countByHostname[hostname]) {
      countByHostname[hostname] = 0;
    }

    countByHostname[hostname]++;
  });

  return countByHostname;
}

function sortHostnamesByCount(countByHostname) {
  var sortedByCount = SortedArray(function(a, b) {
    return b.count - a.count;
  });

  Object.keys(countByHostname).forEach(function(hostname) {
    sortedByCount.add({
      hostname: hostname,
      count: countByHostname[hostname]
    });
  });

  return sortedByCount.items;
}

function createStat(options) {
  return new Stats(options);
}

function getNavigationTimingObject(options) {
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

  return stats;
}

function updateNavigationTiming(stats, hit) {
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
}

function getNavigationTimingStats (hits, options, done) {
  exports.mapReduce(hits, ['navigation'], options, function(err, data) {
    if (err) return done(err);
    done(null, data.navigation);
  });
}

// TODO - this is very similar to countReferrersByHostname, can they be
// combined?
exports.findHostnames = function(hits, done) {
  exports.mapReduce(hits, ['hostnames'], function(err, data) {
    if (err) return done(err);
    done(null, data.hostnames);
  });
};


function updateHostname(hostnames, hit) {
  if (hit.hostname) {
    if ( ! (hit.hostname in hostnames)) {
      hostnames[hit.hostname] = 0;
    }

    hostnames[hit.hostname]++;
  }
}

function updateReferrer(referrers, hit) {
  if ( ! hit.referrer) return;

  var parsed;
  try {
    parsed = url.parse(hit.referrer);
  } catch(e) {
    return;
  }

  var hostname = parsed.hostname;
  if ( ! referrers[hostname]) {
    referrers[hostname] = 0;
  }

  referrers[hostname]++;
}

function updateHitsPerPage(hitsPerPage, hit) {
  hitsPerPage.__all++;

  var path = hit.path;
  if ( ! path) return;

  if ( ! (path in hitsPerPage)) hitsPerPage[path] = 0;

  hitsPerPage[path]++;
}

exports.mapReduce = function(hits, fields, options, done) {
  if (typeof options === "function" && !done) {
    done = options;
    options = {};
  }

  var data = {};

  var doHostnames = fields.indexOf('hostnames') > -1;
  if (doHostnames) data.hostnames = {};

  var doHitsPerPage = fields.indexOf('hits_per_page') > -1;
  if (doHitsPerPage) data.hits_per_page = { __all: 0 };

  var doReferrers = fields.indexOf('referrers') > -1;
  if (doReferrers) data.referrers = { by_hostname: {} };

  var doNavigation = fields.indexOf('navigation') > -1;
  if (doNavigation) data.navigation_values = getNavigationTimingObject(options);

  var doHitsPerDay = fields.indexOf('hits_per_day') > -1;
  if (doHitsPerDay) {
    if ( ! options.start) options.start = earliestDate(hits, 'createdAt');
    if ( ! options.end) options.end = latestDate(hits, 'createdAt');

    data.hits_per_day = {};
    ensurePageInfo(data.hits_per_day, '__all', options.start, options.end);
  }

  hits.forEach(function(hit) {
    if (doHostnames) updateHostname(data.hostnames, hit);
    if (doHitsPerPage) updateHitsPerPage(data.hits_per_page, hit);
    if (doReferrers) updateReferrer(data.referrers.by_hostname, hit);
    if (doNavigation) updateNavigationTiming(data.navigation_values, hit);
    if (doHitsPerDay) updatePageHit(data.hits_per_day, options, hit);
  });

  if (doReferrers) {
    data.referrers.by_count = sortHostnamesByCount(data.referrers.by_hostname);
  }

  if (doNavigation) {
    exports.calculateStats(data.navigation_values, options.navigation.calculate,
        function(err, stats) {
      if (err) return done(err);

      data.navigation = stats;
      done(null, data);
    });

    return;
  }

  done(null, data);
};
