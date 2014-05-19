/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// task to take care of generating connect-fonts CSS and copying font files.

// Locale specific font css are created `app.src/css/fonts/<locale>.css`
// fonts care copied from npm packages into app.src/fonts

module.exports = function (grunt) {
  'use strict';

  var fontPacks = [
    'connect-fonts-bitstream-vera-sans'
  ];

  var fontNamesNeeded = [
    'vera-regular'
  ];

  grunt.config('connect_fonts', {
    dist: {
      options: {
        fontPacks: fontPacks,
        fontNames: fontNamesNeeded,
        languages: [ 'en' ],
        dest: '<%= app.src %>/css/fonts'
      }
    }
  });

  grunt.config('connect_fonts_copy', {
    dist: {
      options: {
        fontPacks: fontPacks,
        dest: '<%= app.src %>/fonts'
      }
    }
  });
};
