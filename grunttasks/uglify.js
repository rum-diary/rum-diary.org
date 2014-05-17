/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = function (grunt) {
  'use strict';

  grunt.task.renameTask('uglify', 'do-uglify');
  grunt.task.registerTask(
    'uglify',
    'compress client side resources',
    function() {

    // The resources have to be included inside of this fake task so we do not
    // load up local config before the selectconfig task has been run.
    var client_deps = require('../server/lib/client-resources');

    var files = {};
    for (var key in client_deps.all) {
      files[ '<%= app.dist %>' + client_deps.concatenated(key)] = getDevResourcePaths(key);
    }

    grunt.config('do-uglify', {
      options: {
        banner: grunt.file.read(path.join(__dirname, '..', 'LICENSE'))
      },
      dist: {
        files: files
      }
    });

    grunt.task.run(['do-uglify']);

    function getDevResourcePaths(key) {
      var deps = client_deps.unconcatenated(key);
      return deps.map(function(dep) {
        return '<%= app.src %>/' + dep;
      });
    }
  });
};
