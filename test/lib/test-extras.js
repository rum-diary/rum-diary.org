/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Test helper functions. Higher order assertions.

// cPass - curried pass - call done when done.
exports.cPass = function cPass(done) {
  return function () {
    done();
  };
};

// fail - straight up failure.
exports.fail = function fail(err) {
  assert.fail(String(err.message));
}


