/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const CONFIG_ROOT = path.join(__dirname, '..', 'server', 'etc');
const TARGET_TO_CONFIG = {
  src: path.join(CONFIG_ROOT, 'local.json'),
  test: path.join(CONFIG_ROOT, 'local.json'),
  dist: path.join(CONFIG_ROOT, 'production.json')
};

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('selectconfig', function(target) {
    if ( ! target) {
      target = 'src';
    }

    process.env.CONFIG_FILES = TARGET_TO_CONFIG[target];

    console.log('Using configuration files', process.env.CONFIG_FILES);
  });
};
