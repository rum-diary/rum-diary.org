/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*
 * dictionary of client resources.
 *
 * each key value pair is:
 *   key: concatenated resource name
 *   value: array of resources to include.
 */
const DEPENDENCIES = {
  /*
  'include.js': [
    'include.js'
  ],
  */
  'js/rum-diary.min.js': [
    '/js/app.bundle.js'
  ],
  'js/signin.min.js': [
    '/js/signin.bundle.js'
  ]
};

module.exports = function (config) {
  return {
    get: function (namespace) {
      if (config.get('use_concatenated_resources'))
        return this.concatenated(namespace);

      return this.unconcatenated(namespace);
    },

    concatenated: function (namespace) {
      return ['/' + namespace];
    },

    unconcatenated: function (namespace) {
      var deps = DEPENDENCIES[namespace];

      return deps.map(function (dep) {
        if (dep.path) return dep.path
        return dep;
      });
    },

    all: DEPENDENCIES,

    testing: function (namespace) {
      var deps = DEPENDENCIES[namespace];

      return deps.map(function (dep) {
        if (dep.filter && dep.filter.indexOf('testing') > -1) return [];

        if ( ! dep.path) return [ '/src' + dep ];

        var parts = [ '/src' + dep.path ];
        if (dep.test) parts.push(dep.test);

        return parts;
      }).reduce(function (returnedDeps, curr) {
        return returnedDeps.concat(curr);
      }, []);
    }
  };
};
