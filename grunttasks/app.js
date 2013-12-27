#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = function (grunt) {
  'use strict';

  var STATIC_ROOT = path.join(__dirname, '..', 'client');

  grunt.config('app', {
    src: path.join(STATIC_ROOT, 'src'),
    dist: path.join(STATIC_ROOT, 'dist')
  });
};
