/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;

const MetricsCollector = require('../../server/lib/metrics-collector');
const db = require('../../server/lib/db');
const siteCollection = db.site;
const pageViewCollection = db.pageView;

/*global describe, it */

describe('lib/metrics-collector', function () {
  var metricsCollector;

  beforeEach(function () {
    db.clear();

    metricsCollector = new MetricsCollector();
  });

  afterEach(function () {
    db.clear();
  });

  describe('write', function () {
    describe('with a non-registered host', function () {
      it('rejects the data', function () {
        return metricsCollector.write({
              location: 'http://not-registered.com/page'
            })
            .then(null, function (err) {
              return err;
            })
            .then(function (err) {
              assert.isTrue(err instanceof MetricsCollector.NonExistentSiteError);
            });
      });
    });

    describe('with an invalid host', function () {
      it('rejects the data', function () {
        return metricsCollector.write({
              location: '!#%^^'
            })
            .then(null, function (err) {
              return err;
            })
            .then(function (err) {
              assert.isTrue(err instanceof MetricsCollector.InvalidLocationError);
            });
      });
    });

    describe('with a registered host and multiple page views', function () {
      it('saves the data', function () {
        return siteCollection.registerNewSite(
                  'registered.com', 'testuser@testuser.com')
            .then(function () {
              return metricsCollector.write([{
                  location: 'http://registered.com/page',
                  uuid: 'this is the uuid',
                  referrer: 'https://referrer.com/thepage',
                  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:29.0) Gecko/20100101 Firefox/29.0'
                }, {
                  location: 'http://registered.com/page',
                  uuid: 'this is the second uuid',
                  referrer: 'https://referrer.com/thepage',
                  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:29.0) Gecko/20100101 Firefox/29.0'
                }]);
            })
            .then(function () {
              return pageViewCollection.getOne({ uuid: 'this is the uuid' });
            })
            .then(function (pageView) {
              assert.ok(pageView);

              return pageViewCollection.getOne({ uuid: 'this is the second uuid' });
            })
            .then(function (pageView) {
              assert.ok(pageView);
            });
      });
    });

    describe('with a registered host and a new page view', function () {
      it('saves the data', function () {
        return siteCollection.registerNewSite(
                  'registered.com', 'testuser@testuser.com')
            .then(function () {
              return metricsCollector.write({
                  location: 'http://registered.com/page',
                  uuid: 'this is the uuid',
                  referrer: 'https://referrer.com/thepage',
                  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:29.0) Gecko/20100101 Firefox/29.0'
                });
            })
            .then(function () {
              return pageViewCollection.getOne({ uuid: 'this is the uuid' });
            })
            .then(function (pageView) {
              assert.equal(pageView.hostname, 'registered.com');
              assert.equal(pageView.path, '/page');

              assert.equal(pageView.referrer_hostname, 'referrer.com');
              assert.equal(pageView.referrer_path, '/thepage');

              assert.equal(pageView.os_parsed.family, 'Mac OS X');

              assert.equal(pageView.browser.family, 'Firefox');
              assert.equal(pageView.browser.major, 29);
              assert.equal(pageView.browser.minor, 0);

              assert.isTrue(pageView.is_exit);
            });
      });
    });

    describe('updating a page view', function () {
      it('updates the duration', function () {
        return siteCollection.registerNewSite(
                  'registered.com', 'testuser@testuser.com')
            .then(function () {
              return metricsCollector.write({
                  location: 'http://registered.com/page',
                  uuid: 'this is the uuid'
                });
            })
            .then(function () {
              return metricsCollector.write({
                  uuid: 'this is the uuid',
                  duration: 656,
                  location: 'https://location-change-is-ignored.com/'
                });
            })
            .then(function () {
              return pageViewCollection.getOne({ uuid: 'this is the uuid' });
            })
            .then(function (pageView) {
              assert.equal(pageView.hostname, 'registered.com');
              assert.equal(pageView.path, '/page');
              assert.equal(pageView.duration, 656);
            });
      });
    });

    describe('update a previous page\'s refer to info', function () {
      it('updates the duration', function () {
        return siteCollection.registerNewSite(
                  'registered.com', 'testuser@testuser.com')
            .then(function () {
              return metricsCollector.write({
                  location: 'http://registered.com/page1',
                  uuid: 'first'
                });
            })
            .then(function () {
              return metricsCollector.write({
                  location: 'http://registered.com/page2',
                  referrer: 'http://registered.com/page1',
                  uuid: 'second',
                  puuid: 'first'
                });
            })
            .then(function () {
              return pageViewCollection.getOne({ uuid: 'first' });
            })
            .then(function (pageView) {
              assert.isFalse(pageView.is_exit);
              assert.equal(pageView.refer_to, 'http://registered.com/page2');
              assert.equal(pageView.refer_to_hostname, 'registered.com');
              assert.equal(pageView.refer_to_path, '/page2');
            })
            .then(function () {
              return pageViewCollection.getOne({ uuid: 'second' });
            })
            .then(function (pageView) {
              assert.isTrue(pageView.is_exit);
              assert.equal(pageView.referrer_hostname, 'registered.com');
              assert.equal(pageView.referrer_path, '/page1');
            });
      });
    });
  });
});

