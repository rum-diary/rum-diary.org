/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');

const getQuery = require('../../server/lib/site-query');

describe('site-query', function() {
  it('should get the hostname from req.params.hostname', function() {
    var query = getQuery({
      params: { hostname: 'testdomain.org' },
      query: {}
    });

    assert.equal(query.hostname, 'testdomain.org');
  });

  it('should set a default start and end date if they are not specified', function() {
    var query = getQuery({
      params: { hostname: 'testdomain.org' },
      query: {}
    });

    assert.ok(query.start);
    assert.ok(query.end);
  });

  it('should use start and end from query string, if specified', function() {
    var query = getQuery({
      params: { hostname: 'testdomain.org' },
      query: {
        start: '2013-12-31',
        end: '2014-01-07'
      }
    });

    assert.ok(moment(query.start).isSame(moment('2013-12-31').startOf('day')));
    assert.ok(moment(query.end).isSame(moment('2014-01-07').endOf('day')));
  });

  it('should convert CSV of tags, when specified', function() {
    var query = getQuery({
      params: { hostname: 'testdomain.org' },
      query: {
        tags: 'experiment1,!experiment2'
      }
    });

    assert.deepEqual(query.tags.$in, ['experiment1']);
    assert.deepEqual(query.tags.$nin, ['experiment2']);
  });

  it('should add referrer, when specified', function() {
    var query = getQuery({
      params: { hostname: 'testdomain.org' },
      query: {
        referrer: 'othersite.org'
      }
    });

    assert.ok(query.referrer, 'othersite.org');
  });
});
