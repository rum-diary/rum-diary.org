/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('useminPrepare', {
      html: '<%= app.static_template_src %>/**/*.html',
      options: {
        // root must be specified or else useminPrepare uses the template
        // directory as the root from where to search for assets.
        root: '<%= app.src %>',
        dest: '<%= app.dist %>'
      }
  });

  grunt.config('usemin', {
    options: {
      assetsDirs: ['<%= app.dist %>']
    },
    html: [
      '<%= app.static_template_dist %>/*.html'
    ],
    css: ['<%= app.dist %>/css/{,*/}*.css']
  });
};
