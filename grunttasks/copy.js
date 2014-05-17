/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copy', {
    dist: {
      files: [{
        // most files. JS will be copied in the uglify task.
        expand: true,
        cwd: '<%= app.src %>',
        src: [
          '**/*.css',
          'i/*'
        ],
        dest: '<%= app.dist %>'
      }, {
        // uncompressed include.js
        cwd: '<%= app.src %>',
        src: '<%= app.src %>/include.js',
        dest: '<%= app.dist %>/include.orig.js'
      }]
    }
  });
};
