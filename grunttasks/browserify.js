/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const browserify = require('browserify');
const mold = require('mold-source-map');
const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {
  const appJSRoot = grunt.config.get('app.src_js');
  const staticRoot = grunt.config.get('app.static_root');

  const APP_BUNDLES = {
    cwd: appJSRoot,
    files: {
      'app.bundle.js': 'start.js',
      'signin.bundle.js': 'pages/signin.js'
    }
  };

  const TEST_BUNDLES = {
    cwd: staticRoot,
    files: {
      'tests/test_bundle.js': 'tests/run.js'
    }
  };

  'use strict';

  grunt.registerTask('browserify', function (target) {
    var done = this.async();

    if (target === 'dist') {
      return bundleAll(APP_BUNDLES, done);
    }

    var config = target === 'test' ? TEST_BUNDLES : APP_BUNDLES;
    bundleAllWithSourceMap(config, done);
  });
};

function bundleAllWithSourceMap(config, done) {
  nextBundle(config, Object.keys(config.files), createBundleWithSourceMap, done);
}

function bundleAll(config, done) {
  nextBundle(config, Object.keys(config.files), createBundle, done);
}

function nextBundle(config, remaining, bundler, done) {
  var dest = remaining.shift();
  if ( !dest) return done();

  var cwd = config.cwd;
  var startPath = path.join(cwd, config.files[dest]);
  var destPath = path.join(cwd, dest);

  bundler(startPath, destPath, cwd, nextBundle.bind(null, config, remaining, bundler, done));
}

function createBundleWithSourceMap(startPath, destPath, jsRoot, done) {
  var outputStream = fs.createWriteStream(destPath);
  outputStream.on('end', done);
  outputStream.on('drain', done);

  console.error('Creating dev bundle: %s=>%s->%s', jsRoot, startPath, destPath);

  browserify()
    .require(path.join(jsRoot, 'bower_components', 'd3', 'd3.js'), { expose: 'd3'})
    .require(startPath, { entry: true })
    .bundle({ debug: true })

    // will show all source files relative to jsRoot inside devtools
    .pipe(mold.transformSourcesRelativeTo(jsRoot))
    .pipe(outputStream);
}

function createBundle(startPath, destPath, jsRoot, done) {
  var outputStream = fs.createWriteStream(destPath);
  // XXX yes, this is a horrible, horrible hack. For some reason, in prod mode,
  // the end event is never triggered and the task never stops.
  var timeout = setTimeout(done, 2000);
  outputStream.on('end', function() {
    clearTimeout(timeout);
    done();
  });

  console.error('Creating dist bundle: %s=>%s->%s', jsRoot, startPath, destPath);

  browserify()
    .require(path.join(jsRoot, 'bower_components', 'd3', 'd3.js'), { expose: 'd3'})
    .require(startPath, { entry: true })
    .bundle({ debug: false })
    .pipe(outputStream);
}

