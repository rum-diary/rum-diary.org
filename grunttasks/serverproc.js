/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.task.registerTask('serverproc', function () {
    // run_server has to be included inside of the task so we do not
    // load up local config before the selectconfig task has been run.
    var run_server = require('../scripts/run_locally');
    run_server(this.async());
  });
};
