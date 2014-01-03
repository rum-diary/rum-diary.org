/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');
const navigationTimingData = require('./data/navigation-timing.json');

const reduce = require('../server/lib/reduce');

describe('reduce', function() {
  it('pageHitsPerDay', function() {
    var pageHitsPerDay = reduce.pageHitsPerDay([
      {
        path: '/',
        createdAt: moment().toDate()
      },
      {
        path: '/',
        createdAt: moment().toDate()
      },
      {
        path: '/',
        createdAt: moment().subtract('days', 2).toDate()
      },
      {
        path: '/page',
        createdAt: moment().toDate()
      },
      {
        path: '/page',
        createdAt: moment().subtract('days', 4).toDate()
      }
    ]);

    assert.equal(pageHitsPerDay['/'][0].date, moment().format('YYYY-MM-DD'));
    assert.equal(pageHitsPerDay['/'][0].hits, 2);
    assert.equal(pageHitsPerDay['/'][2].date, moment().subtract('days', 2).format('YYYY-MM-DD'));
    assert.equal(pageHitsPerDay['/'][2].hits, 1);
    assert.equal(pageHitsPerDay['/page'][4].hits, 1);

    // all pages for the domain are hitsed under the '__all' namespace
    assert.isArray(pageHitsPerDay['__all'], 3);
    assert.equal(pageHitsPerDay['__all'][0].hits, 3);
    assert.equal(pageHitsPerDay['__all'][0].date, moment().format('YYYY-MM-DD'));
  });

  it('pageHitsPerPage', function() {
    var pageHitsPerPage = reduce.pageHitsPerPage([
      {
        path: '/',
        createdAt: moment().toDate()
      },
      {
        path: '/',
        createdAt: moment().toDate()
      },
      {
        path: '/',
        createdAt: moment().subtract('days', 2).toDate()
      },
      {
        path: '/page',
        createdAt: moment().toDate()
      },
      {
        path: '/page',
        createdAt: moment().subtract('days', 4).toDate()
      }
    ]);

    assert.equal(pageHitsPerPage['/'], 3);
    assert.equal(pageHitsPerPage['/page'], 2);
  });

  it('findMedianNavigationTimes', function(done) {
    reduce.findMedianNavigationTimes(navigationTimingData, function(err, medianInfo) {
      assert.isNull(err);

      assert.isNumber(medianInfo.unloadEventStart);
      assert.isNumber(medianInfo.unloadEventEnd);
      assert.isNumber(medianInfo.unloadEventDuration);

      assert.isNumber(medianInfo.navigationStart);
      assert.isNumber(medianInfo.redirectStart);
      assert.isNumber(medianInfo.redirectEnd);
      assert.isNumber(medianInfo.redirectDuration);

      assert.isNumber(medianInfo.fetchStart);

      assert.isNumber(medianInfo.domainLookupStart);
      assert.isNumber(medianInfo.domainLookupEnd);
      assert.isNumber(medianInfo.domainLookupDuration);

      assert.isNumber(medianInfo.connectStart);
      assert.isNumber(medianInfo.secureConnectionStart);
      assert.isNumber(medianInfo.connectEnd);
      assert.isNumber(medianInfo.connectDuration);

      assert.isNumber(medianInfo.requestStart);
      assert.isNumber(medianInfo.responseStart);
      assert.isNumber(medianInfo.responseEnd);
      assert.isNumber(medianInfo.requestResponseDuration);

      assert.isNumber(medianInfo.domLoading);
      assert.isNumber(medianInfo.domInteractive);
      assert.isNumber(medianInfo.domContentLoadedEventStart);
      assert.isNumber(medianInfo.domContentLoadedEventEnd);
      assert.isNumber(medianInfo.domContentLoadedEventDuration);
      assert.isNumber(medianInfo.domComplete);
      assert.isNumber(medianInfo.processingDuration);

      assert.isNumber(medianInfo.loadEventStart);
      assert.isNumber(medianInfo.loadEventEnd);
      assert.isNumber(medianInfo.loadEventDuration);

      done();
    });
  });

  it('findNavigationTimingStats', function(done) {
    reduce.findNavigationTimingStats(
      navigationTimingData,
      ['range', 'median', 'amean', 'stddev'],
      function(err, stats) {
      assert.isNull(err);

      var medianInfo = stats.median;
      assert.isNumber(medianInfo.requestStart);
      assert.isNumber(medianInfo.responseStart);
      assert.isNumber(medianInfo.responseEnd);
      assert.isNumber(medianInfo.requestResponseDuration);

      assert.isNumber(medianInfo.domLoading);
      assert.isNumber(medianInfo.domInteractive);
      assert.isNumber(medianInfo.domContentLoadedEventStart);
      assert.isNumber(medianInfo.domContentLoadedEventEnd);
      assert.isNumber(medianInfo.domContentLoadedEventDuration);
      assert.isNumber(medianInfo.domComplete);
      assert.isNumber(medianInfo.processingDuration);

      assert.isNumber(medianInfo.loadEventStart);
      assert.isNumber(medianInfo.loadEventEnd);
      assert.isNumber(medianInfo.loadEventDuration);

      var rangeInfo = stats.range;
      assert.isArray(rangeInfo.requestStart);
      assert.isArray(rangeInfo.responseStart);
      assert.isArray(rangeInfo.responseEnd);
      assert.isArray(rangeInfo.requestResponseDuration);

      assert.isArray(rangeInfo.domLoading);
      assert.isArray(rangeInfo.domInteractive);
      assert.isArray(rangeInfo.domContentLoadedEventStart);
      assert.isArray(rangeInfo.domContentLoadedEventEnd);
      assert.isArray(rangeInfo.domContentLoadedEventDuration);
      assert.isArray(rangeInfo.domComplete);
      assert.isArray(rangeInfo.processingDuration);

      assert.isArray(rangeInfo.loadEventStart);
      assert.isArray(rangeInfo.loadEventEnd);
      assert.isArray(rangeInfo.loadEventDuration);
      done();
    });
  });

  it('findReferrers', function(done) {
    reduce.findReferrers(
      navigationTimingData,
      function(err, data) {

      assert.isNull(err);

      assert.equal(data.by_hostname['localhost'], 9);
      assert.equal(data.by_count[0].hostname, 'localhost');
      assert.equal(data.by_count[0].count, 9);

      done();
    });
  });
});

