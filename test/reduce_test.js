/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');
const url = require('url');
const navigationTimingData = require('./data/navigation-timing.json');

const reduce = require('../server/lib/reduce');

/*global describe, it */

describe('reduce', function () {
  /*
  it('findMedianNavigationTimes', function (done) {
    reduce.findMedianNavigationTimes(navigationTimingData, function (err, medianInfo) {
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
*/

  it('findNavigationTimingStats', function (done) {
    reduce.findNavigationTimingStats(
      navigationTimingData,
      ['range', 'median', 'amean', 'stddev'],
      function (err, stats) {
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

  /*
  it('findReferrers', function (done) {
    reduce.findReferrers(
      navigationTimingData,
      function (err, data) {

      assert.isNull(err);

      assert.equal(data.by_hostname['localhost'], 9);
      assert.equal(data.by_count[0].hostname, 'localhost');
      assert.equal(data.by_count[0].count, 9);

      done();
    });
  });
*/

  it('findHostnames', function (done) {
    reduce.findHostnames(
      navigationTimingData,
      function (err, data) {

      assert.isNull(err);

      assert.equal(data.localhost, 9);

      done();
    });
  });

  it('mapReduce', function (done) {
    var copy = [];

    // give us a respectable amount of data
    while(copy.length < 100000) {
      copy = copy.concat(navigationTimingData);
    }

    copy.forEach(function (item, index) {
      // test to make sure items that were saved with
      // only referrer are handled correctly.
      if (index > 1000) {
        item.referrer_hostname = url.parse(item.referrer).hostname;
      }
    });

    reduce.mapReduce(copy, [
      'hostnames',
      'hits_per_page',
      'referrers',
      'navigation',
      'hits_per_day'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment(),
      navigation: {
        calculate: ['median']
      }
    }).then(function (data) {
      console.log('processing time full: %s ms', data.processing_time);
      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce with navigation quartiles', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'navigation'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment(),
      navigation: {
        calculate: ['quartiles']
      }
    }).then(function (data) {
      console.log('processing time quartiles: %s ms', data.processing_time);
      assert.ok(data.navigation['25']);
      assert.ok(data.navigation['50']);
      assert.ok(data.navigation['75']);

      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce to calculate unique visitors', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'unique'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    }).then(function (data) {
      assert.equal(data.unique, 8);

      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce to calculate returning visitors', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'returning'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    }).then(function (data) {
      assert.equal(data.returning, 1);

      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce to calculate browsers', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'browsers'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    }).then(function (data) {
      assert.equal(data.browsers.Firefox, 7);
      assert.equal(data.browsers['Mobile Safari'], 1);
      assert.equal(data.browsers['Chrome Mobile'], 1);
      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce to calculate operating systems', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'os'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    }).then(function (data) {
      // tests for both parsed and unparsed OS'
      assert.equal(data.os['Mac OS X 10'], 1);
      assert.equal(data.os['Windows 7'], 6);
      assert.equal(data.os['iOS 7'], 1);
      assert.equal(data.os['Android 4.4'], 1);
      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });

  it('mapReduce to calculate operating systems based on form factor (mobile vs desktop)',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'os:form'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    }).then(function (data) {
      assert.equal(data['os:form'].desktop['Mac OS X 10'], 1);
      assert.equal(data['os:form'].desktop['Windows 7'], 6);
      assert.equal(data['os:form'].mobile['iOS 7'], 1);
      assert.equal(data['os:form'].mobile['Android 4.4'], 1);
      done();
    }).error(function (err) {
      assert.isTrue(false, err);
      done();
    });
  });
});

