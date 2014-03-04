/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const navigationTimingData = require('../data/navigation-timing.json');

const Stream = require('../../server/lib/reduce/exit');

// cPass - curried pass - call done when done.
function cPass(done) {
  return function () {
    done();
  };
}

// fail - straight up failure.
function fail(err) {
  assert.fail(String(err));
}

/*global describe, it */

describe('reduce/exit', function () {
  var stream;

  beforeEach(function () {
    stream = new Stream();
    navigationTimingData.forEach(function(pageView) {
      stream.write(pageView);
    });
  });

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('result', function () {
    it('returns pages with is_exit set to true', function () {
      var result = stream.result();

      assert.equal(result['/site/localhost'], 3);
      assert.equal(Object.keys(result).length, 1);
    });
  });
});

