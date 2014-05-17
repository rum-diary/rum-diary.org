/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('zopfli', {
    'options': {
      'iterations': 100
    },
    'dist': {
      'files': [
        {
          cwd: '<%= app.static_root %>',
          src: ['dist/**/*.js'],
          dest: '<%= app.static_root %>',
          expand: true,
          ext: '.js.gz',
          extDot: 'last'
        },
        {
          cwd: '<%= app.static_root %>',
          src: ['dist/**/*.css'],
          dest: '<%= app.static_root %>',
          expand: true,
          ext: '.css.gz',
          extDot: 'last'
        }
      ]
    }
  });
};

