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

    console.log(pageHitsPerDay);
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
});

