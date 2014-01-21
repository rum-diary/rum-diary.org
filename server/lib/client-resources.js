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
    '/js/lib/dominator.js',
    '/js/rum-diary.js',
    {
      path: '/js/string.js',
      test: 'spec/string_test.js'
    },
    {
      path: '/js/tooltip.js',
      test: 'spec/tooltip_test.js'
    },
    '/js/graphs/graphs.js',
    {
      path: '/js/graphs/hits.js',
      test: 'spec/graphs/hits_test.js'
    },
    {
      path: '/js/graphs/navigation-timing.js',
      test: 'spec/graphs/navigation-timing_test.js'
    },
    {
      path: '/js/graphs/histogram.js',
      test: 'spec/graphs/histogram_test.js'
    },
    {
      path: '/js/start.js',
      filter: ['testing']
    }
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
