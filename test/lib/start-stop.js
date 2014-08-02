/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helpers to start and stop the server.

const spawn = require('child_process').spawn;
const path = require('path');

var proc;
process.on('exit', function () {
  if (proc) proc.kill();
});

exports.start = function start(done) {
  var START_PATH = path.join(__dirname, '..', '..', 'server', 'start.js');
  proc = spawn('node', [ START_PATH ]);

  proc.stdout.on('data', function (buf) {
    var str = buf.toString();
    if (done && /http listening on port/.test(str)) {
      done();
      done = null;
    }
  });

  proc.stderr.on('data', function (buf) {
    console.error(buf.toString());
  });
}

exports.stop = function stop(done) {
  proc.kill('SIGINT');
  proc.on('exit', function () {
    proc = null;
    if (done) done();
  });
}


