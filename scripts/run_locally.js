#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const spawn = require('child_process').spawn;


const BIN_ROOT = path.join(__dirname, '..', 'server');

module.exports = function (done) {
  process.chdir(path.dirname(__dirname));
  // We'll get PORT via config/local.json
  // This is required for Travis-CI to work correctly.
  delete process.env['PORT'];

  var startPath = path.join(BIN_ROOT, 'start.js');
  var serverProc = spawn('node', [startPath]);
  serverProc.stdout.on('data', function(data) {
    console.log(data.toString('utf8').trim());
  });
  serverProc.stderr.on('data', function(data) {
    console.error(data.toString('utf8').trim());
  });
  serverProc.on('exit', function(code, signal) {
    console.log('server killed, exiting');
    if (done) done(code);
    else process.exit(code);
  });
};

// only start the server if the file is called directly, otherwise wait until
// module.exports is called.
if (process.argv[1] === __filename) module.exports();

