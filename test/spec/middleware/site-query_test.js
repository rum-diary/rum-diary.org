/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const moment = require('moment');

const siteQuery = require('../../../server/lib/middleware/site-query');

/*global describe, it*/

describe('site-query', function () {
  it('should set a default start and end date if they are not specified', function (done) {
    var req = {
      params: { hostname: 'testdomain.org' },
      query: {}
    };

    siteQuery(req, {}, function () {
      var query = req.dbQuery;
      assert.ok(query.start);
      assert.ok(query.end);
      done();
    });
  });

  it('should use start and end from query string, if specified', function (done) {
    var req = {
      params: { hostname: 'testdomain.org' },
      query: {
        start: '2013-12-31',
        end: '2014-01-07'
      }
    };

    siteQuery(req, {}, function () {
      var query = req.dbQuery;
      assert.ok(moment(query.start).isSame(moment('2013-12-31').startOf('day')));
      assert.ok(moment(query.end).isSame(moment('2014-01-07').endOf('day')));
      done();
    });
  });

  it('should convert CSV of tags, when specified', function (done) {
    var req = {
      params: { hostname: 'testdomain.org' },
      query: {
        tags: 'experiment1,!experiment2'
      }
    };


    siteQuery(req, {}, function () {
      var query = req.dbQuery;
      assert.deepEqual(query.tags.$in, ['experiment1']);
      assert.deepEqual(query.tags.$nin, ['experiment2']);
      done();
    });
  });

  it('should add referrer, when specified', function (done) {
    var req = {
      params: { hostname: 'testdomain.org' },
      query: {
        referrer: 'othersite.org'
      }
    };

    siteQuery(req, {}, function () {
      assert.ok(req.dbQuery.referrer, 'othersite.org');
      done();
    });
  });
});
