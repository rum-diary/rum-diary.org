/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.task.renameTask('string-replace', 'do-string-replace');
  grunt.task.registerTask(
    'string-replace',
    'preprocess include.js based off of client side configuration',
    function() {
      // Correct configuration will be loaded based
      // on process.env.CONFIG_FILES when the selectconfig task is run. If
      // selectconfig is not run, local.json will be used by default.
      var config = require('../server/lib/config');

      grunt.config('do-string-replace', {
        js: {
          files: {
            '<%= app.src %>/include.js': '<%= app.src %>/bower_components/rum-diary-js-client/dist/rum-diary-js-client.js',
          },
          options: {
            replacements: [{
              pattern: /https:\/\/rum-diary.org/g,
              replacement: config.get('data_collection_server')
            }]
          }
        }
      });

      grunt.task.run(['do-string-replace']);
    }
  );
};
