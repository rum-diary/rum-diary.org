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
    /*'/js/lib/micrajax.js',*/
    '/js/rum-diary.js',
    '/js/string.js',
    '/js/tooltip.js',
    '/js/graphs/graphs.js',
    '/js/graphs/hits.js',
    '/js/graphs/navigation-timing.js',
    '/js/start.js'
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
  return DEPENDENCIES[namespace];
};
