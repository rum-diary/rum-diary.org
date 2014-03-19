/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const browserify = require('browserify');
const mold = require('mold-source-map');
const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {
  'use strict';

  var appJSRoot = grunt.config.get('app.src_js');
  var appStartPath = path.join(appJSRoot, 'start.js');
  var appBundlePath = path.join(appJSRoot, 'bundle.js');

  var staticRoot = grunt.config.get('app.static_root');
  var testJSRoot = grunt.config.get('app.src_test');
  var testStartPath = path.join(testJSRoot, 'run.js');
  var testBundlePath = path.join(testJSRoot, 'test_bundle.js');

  grunt.registerTask('browserify', function (target) {
    var done = this.async();

    if (target === 'dist') {
      createDistBundle(appStartPath, appBundlePath, appJSRoot, done);
    } else if (target === 'test') {
      createDevBundle(testStartPath, testBundlePath, staticRoot, done);
    } else {
      createDevBundle(appStartPath, appBundlePath, appJSRoot, done);
    }
  });
};

function createDevBundle(startPath, bundlePath, jsRoot, done) {
  var outputStream = fs.createWriteStream(bundlePath);
  outputStream.on('end', done);
  outputStream.on('drain', done);

  console.error('Creating dev bundle: %s=>%s->%s', jsRoot, startPath, bundlePath);

  browserify()
    .require(startPath, { entry: true })
    .bundle({ debug: true })

    // will show all source files relative to jsRoot inside devtools
    .pipe(mold.transformSourcesRelativeTo(jsRoot))
    .pipe(outputStream);
}

function createDistBundle(startPath, bundlePath, jsRoot, done) {
  var outputStream = fs.createWriteStream(bundlePath);
  // XXX yes, this is a horrible, horrible hack. For some reason, in prod mode,
  // the end event is never triggered and the task never stops.
  setTimeout(done, 2000);
  /*outputStream.on('end', done);*/

  console.error('Creating dist bundle: %s=>%s->%s', jsRoot, startPath, bundlePath);

  browserify()
    .require(startPath, { entry: true })
    .bundle({})
    .pipe(outputStream);
}

