/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');

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

    assert.equal(pageHitsPerDay['/'][moment().format('YYYY-MM-DD')].count, 2);
    assert.equal(pageHitsPerDay['/'][moment().subtract('days', 2).format('YYYY-MM-DD')].count, 1);
    assert.equal(pageHitsPerDay['/page'][moment().subtract('days', 4).format('YYYY-MM-DD')].count, 1);

    // all pages for the domain are counted under the '__all' namespace
    assert.equal(pageHitsPerDay['__all'][moment().format('YYYY-MM-DD')].count, 3);

  });
});

