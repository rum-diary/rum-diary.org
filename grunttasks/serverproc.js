/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function (grunt) {
  'use strict';

  grunt.task.registerTask('serverproc', function () {
    var done = this.async();

    // run_server has to be included inside of the task so we do not
    // load up local config before the selectconfig task has been run.
    var BIN_ROOT = path.join(__dirname, '..', 'server');

    var startPath = path.join(BIN_ROOT, 'start.js');
    var serverProc = spawn('node', [startPath]);
    serverProc.stdout.on('data', function(data) {
      console.log(data.toString('utf8').trim());
    });
    serverProc.stderr.on('data', function(data) {
      console.error(data.toString('utf8').trim());
    });
    serverProc.on('exit', function(code) {
      console.log('server killed, exiting');
      done(code);
    });
  });
};
