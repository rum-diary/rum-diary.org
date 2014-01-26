/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = function (grunt) {
  'use strict';

  var STATIC_ROOT = path.join(__dirname, '..', 'client');

  grunt.loadNpmTasks('grunt-zopfli');

  grunt.config('zopfli', {
    'options': {
      iterations: 100
    },
    'dist': {
      'files': [
        {
          'src': [STATIC_ROOT + '/dist/include.js'],
          'dest': STATIC_ROOT + '/dist/include.js.gz'
        },
        {
          'src': [STATIC_ROOT + '/dist/rum-diary.min.js'],
          'dest': STATIC_ROOT + '/dist/rum-diary.min.js.gz'
        },
        {
          'cwd': STATIC_ROOT,
          'src': ['dist/**/*.css'],
          'dest': STATIC_ROOT,
          'expand': true,
          'ext': '.css.gz'
        }
      ]
    }
  });
};

