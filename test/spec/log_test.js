/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const path = require('path');
const fs = require('fs');

const startStop = require('../lib/start-stop');

const config = require('../../server/lib/config');

const LOG_DIR = config.get('logging_dir');
const LOG_PATH = path.join(LOG_DIR, config.get('proc_name'));

describe('logging module', function() {
  beforeEach(removeExistingLog);

  describe('start', function() {
    it('starts the server', function(done) {
      startStop.start(done);
    });
  });

  describe('file logging', function() {
    // file only exists if file logging added correctly.
    assert.ok(fs.existsSync(LOG_PATH));
  });

  describe('stop', function() {
    it('stops', function(done) {
      startStop.stop(done);
    });
  });
});

function removeExistingLog(done) {
  fs.exists(LOG_PATH, function(exists) {
    if ( ! exists) return done();
    fs.unlink(LOG_PATH, done);
  });
}
