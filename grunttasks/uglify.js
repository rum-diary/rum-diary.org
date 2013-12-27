/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const client_deps = require('../server/lib/client-resources');

module.exports = function (grunt) {
  'use strict';

  // TODO - see if this can be automated by using the keys in
  // client-resources
  grunt.config('uglify', {
    options: {
      banner: grunt.file.read(path.join(__dirname, '..', 'LICENSE'))
    },
    dist: {
      files: {
        '<%= app.dist %>/include.js': [ '<%= app.src %>/include.js' ],
        '<%= app.dist %>/rum-diary.min.js': getClientDeps('rum-diary.min.js')
      }
    }
  });

  function getClientDeps(key) {
    var deps = client_deps.unconcatenated(key);
    return deps.map(function(dep) {
      return '<%= app.dist %>/' + dep;
    });
  }
};

