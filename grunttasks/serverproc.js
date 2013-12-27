/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const run_server = require('../scripts/run_locally');

module.exports = function (grunt) {
  'use strict';

  grunt.task.registerTask('serverproc', function () {
    run_server(this.async());
  });
};
