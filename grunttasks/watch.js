/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('watch', {
    include_js: {
      files: '<%= app.src %>/js-templates/*.js',
      tasks: [ 'preprocess' ]
    },
    scripts: {
      files: ['<%= app.src_js %>/**/*.js', '!<%= app.src_js %>/**/*bundle.js'],
      tasks: [ 'browserify' ]
    },
    test_scripts: {
      files: '<%= app.src_test %>/**/*.js',
      tasks: [ 'browserify:test' ]
    },
    sass: {
      files: '<%= app.src %>/**/*.scss',
      tasks: [ 'sass' ]
    }
  });
};
