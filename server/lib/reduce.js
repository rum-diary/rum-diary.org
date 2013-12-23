/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getPathDateInfo(returnedData, path, date) {
  if ( ! (path in returnedData)) {
    returnedData[path] = {};
  }

  if ( ! (date in returnedData[path])) {
    returnedData[path][date] = {};
  }

  return returnedData[path][date];
}

function incrementPageHit(returnedData, path, date) {
  var pathDateInfo = getPathDateInfo(returnedData, path, date);
  if ( ! ("count" in pathDateInfo)) {
    pathDateInfo.count = 0;
  }
  pathDateInfo.count++;
}

exports.pageHitsPerDay = function (hitsForHost) {
  var returnedData = {
    all: {}
  };

  hitsForHost.forEach(function (item) {
    var date = moment(item.createdAt).format('YYYY-MM-DD');

    if (item.path)
      incrementPageHit(returnedData, item.path, date);
    incrementPageHit(returnedData, '__all', date);
  });

  return returnedData;
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

