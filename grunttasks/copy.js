/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copy', {
    dist: {
      files: [{
        // image files.
        // JS will be copied in the uglify task.
        // CSS will be copied in the cssmin task
        expand: true,
        cwd: '<%= app.src %>',
        src: [
          'i/*',
          'fonts/{,*/}*.{woff,svg,ofl,eot,ttf}'
        ],
        dest: '<%= app.dist %>'
      }, {
        // uncompressed include.js
        cwd: '<%= app.src %>',
        src: '<%= app.src %>/include.js',
        dest: '<%= app.dist %>/include.orig.js'
      }, {
        // server side rendered templates. Copied so embedded css
        // links can be updated to use concatenated/minified versions.
        expand: true,
        dot: true,
        cwd: '<%= app.static_template_src %>',
        dest: '<%= app.static_template_dist %>',
        src: [
          '**/*.html'
        ]
      }
      ]
    }
  });
};
