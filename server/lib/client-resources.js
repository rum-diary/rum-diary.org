/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config');

/*
 * dictionary of client resources.
 *
 * each key value pair is:
 *   key: concatenated resource name
 *   value: array of resources to include.
 */
const DEPENDENCIES = {
  'rum-diary.min.js': [
    '/js/bower_components/d3/d3.js',
    '/js/app.bundle.js'
  ],
  'signin.min.js': [
    '/js/signin.bundle.js'
  ]
};

module.exports = function(namespace) {
  if (config.get('use_concatenated_resources'))
    return module.exports.concatenated(namespace);

  return module.exports.unconcatenated(namespace);
};

module.exports.concatenated = function(namespace) {
  return ['/' + namespace];
};

module.exports.unconcatenated = function(namespace) {
  var deps = DEPENDENCIES[namespace];

  return deps.map(function(dep) {
    if (dep.path) return dep.path
    return dep;
  });
};

module.exports.testing = function(namespace) {
  var deps = DEPENDENCIES[namespace];

  return deps.map(function(dep) {
    if (dep.filter && dep.filter.indexOf('testing') > -1) return [];

    if ( ! dep.path) return [ '/src' + dep ];

    var parts = [ '/src' + dep.path ];
    if (dep.test) parts.push(dep.test);

    return parts;
  }).reduce(function(returnedDeps, curr) {
    return returnedDeps.concat(curr);
  }, []);
};
