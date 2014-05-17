/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = function (grunt) {
  'use strict';

  var STATIC_ROOT = path.join(__dirname, '..', 'client');
  var STATIC_TEMPLATE_ROOT = path.join(__dirname, '..', 'server', 'views');

  grunt.config('app', {
    static_root: STATIC_ROOT,
    src: path.join(STATIC_ROOT, 'src'),
    src_js: path.join(STATIC_ROOT, 'src', 'js'),
    src_test: path.join(STATIC_ROOT, 'tests'),
    dist: path.join(STATIC_ROOT, 'dist'),
    temp: '.tmp',
    static_template_src: path.join(STATIC_TEMPLATE_ROOT, 'src'),
    static_template_dist: path.join(STATIC_TEMPLATE_ROOT, 'dist')
  });
};
