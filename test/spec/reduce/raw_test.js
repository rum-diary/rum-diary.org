/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const navigationTimingData = require('../../data/navigation-timing.json');

const Stream = require('../../../server/lib/reduce/raw');

/*global describe, it, beforeEach, afterEach */

describe('reduce/raw', function () {
  var stream;

  beforeEach(function () {
    stream = new Stream();
    navigationTimingData.forEach(function(chunk) {
      stream.write(chunk);
    });
  });

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('result', function () {
    it('returns the raw data in an array', function () {
      var result = stream.result();
      assert.equal(result.length, navigationTimingData.length);
      assert.deepEqual(result[0], navigationTimingData[0]);
      assert.deepEqual(result[1], navigationTimingData[1]);
    });
  });
});

