/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Do all the site/page related calculations.

const Promise = require('bluebird');
const db = require('./db');
const ReducingStream = require('rum-diary-queries');

'use strict';

module.exports = {
  db: db,

  init: function (options) {
    options = options || {};

    // a mock db is passed in for testing.
    if (options.db) {
      this.db = options.db;
    }
  },

  calculate: function (config) {
    var start = new Date();
    var queries = [];

    function getWhich(options) {
      options = options || {};
      return Object.keys(options).filter(function (name) {
        return name !== 'filter';
      });
    }

    function getQuery(modelConfig) {
      modelConfig.which = getWhich(modelConfig);
      var targetStream = new ReducingStream(modelConfig);

      return this.db[key].calculate(targetStream, modelConfig)
        .then(function () {
          var result = targetStream.result();
          targetStream.end();
          targetStream = null;
          return result;
        }, function (err) {
          targetStream.end();
          targetStream = null;
          throw err;
        });
    }

    for (var key in config) {
      var modelConfig = config[key];
      queries.push(getQuery.call(this, modelConfig));
    }

    return Promise.all(queries)
      .then(function(_results) {
        var results = promiseArrayToObject(_results, Object.keys(config));

        var end = new Date();
        results.duration = end.getTime() - start.getTime();

        return results;
      });
  }
};

function promiseArrayToObject(_results, keys) {
  var results = {};
  // Promise.all returns an array of results.
  // Translate from the array to an object keyed by
  // table name.
  keys.forEach(function(key, index) {
    results[key] = _results[index];
  });

  return results;
}

