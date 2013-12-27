#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';


  grunt.task.renameTask('preprocess', 'do-preprocess');
  grunt.task.registerTask(
    'preprocess',
    'preprocess client side configuration',
    function() {
      // Correct configuration will be loaded based
      // on process.env.CONFIG_FILES when the selectconfig task is run. If
      // selectconfig is not run, local.json will be used by default.
      var config = require('../server/lib/config');
      var context = {
        dataCollectionServer: config.get('data_collection_server')
      };

      grunt.config('do-preprocess', {
        js: {
          src: '<%= app.src %>/js-templates/include.js',
          dest: '<%= app.src %>/include.js',
          options: {
            context: context
          },
        }
      });

      grunt.task.run(['do-preprocess']);
    }
  );



};
