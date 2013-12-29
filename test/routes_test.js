/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;

const request = require('request');

const spawn = require('child_process').spawn;
const path = require('path');

var ROUTES = {
  'GET /'                             : 200,
  'GET /index.html'                   : 301,
  'GET /site/localhost'               : 200,
  'GET /site/localhost/all'           : 200,
  'GET /site/localhost/navigation'    : 200,
  'GET /site/localhost/navigation/medians'
                                      : 200,
  'GET /site/localhost/navigation/distribution'
                                      : 200,
  'GET /site/localhost/hits'          : 200
};

describe('start', function() {
  it('starts the server', function(done) {
    start(done);
  });
});

describe('request', function() {
  for (var key in ROUTES) {
    it(key, respondsWith(key, ROUTES[key]));
  }
});

describe('stop', function() {
  it('stops', function(done) {
    stop(function() {
      done();
    });
  });
});

function respondsWith(key, expectedCode) {
  return function(done) {
    var parts = key.split(' ');
    var verb = parts[0].toUpperCase();
    var url = 'http://localhost:8000' + parts[1];
    request({
      // disable redirect following to ensure that 301 and 302s are reported.
      followRedirect: false,
      uri: url,
      method: verb,
    }, function(err, response) {
      assert.equal(response.statusCode, expectedCode);
      done();
    });
  };
}


var proc;
process.on('exit', function () {
  if (proc) proc.kill();
});


function start(done) {
  var START_PATH = path.join(__dirname, '..', 'server', 'start.js');
  proc = spawn('node', [ START_PATH ]);
  proc.stdout.on('data', function(buf) {
    var str = buf.toString();
    if (done && /listening on port/.test(str)) {
      done();
      done = null;
    }
  });
  proc.stderr.on('data', function(buf) {
    console.error(buf.toString());
  });
}

function stop(done) {
  proc.kill('SIGINT');
  proc.on('exit', done);
}

