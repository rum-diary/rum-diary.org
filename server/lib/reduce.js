/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const logger = require('./logger');

const WATCH_FOR_MEMORY_LEAKS = false;

/**
 * Generic map-reduce for pageView data. Assumed that all pageViews are for
 * the same hostname.
 *
 * Flow:
 * 1) Create an instance of StreamReaduce with the required reduce functions
 *    declared in 'which'.
 * 2) When a pageView becomes available, write it to the stream with `write`.
 * 3) The data will first go through filters declared in `filter`.
 * 4) The data will then go through each `reduce` stream.
 * 5) Results are fetches using `result`
 * 6) Call `end` to free the stream's references.
 */

if (WATCH_FOR_MEMORY_LEAKS) {
  const memwatch = require('memwatch');
  memwatch.on('leak', function (info) {
    logger.error('memory leak: %s', JSON.stringify(info, null, 2));
  });
  memwatch.on('stats', function (info) {
    logger.warn('memory stats: %s', JSON.stringify(info, null, 2));
  });
}

const STREAM_PATH = path.join(__dirname, 'reduce');
var allStreams = [];
loadDirectory(STREAM_PATH, allStreams);

const FILTER_PATH = path.join(__dirname, 'filter');
var allFilters = [];
loadDirectory(FILTER_PATH, allFilters);

function loadDirectory(pathToLoad, modules) {
  fs.readdirSync(pathToLoad).forEach(function (fileName) {
    // skip files that don't have a .js suffix or start with a dot
    if (path.extname(fileName) !== '.js' || /^\./.test(fileName)) return;
    var module = require(path.join(pathToLoad, fileName));
    modules.push(module);
  });

  return modules;
}


exports.findNavigationTimingStats = function (hits, statsToFind, options) {
  if (! options) options = {};

  if ( ! options.navigation) options.navigation = {};
  options.navigation.calculate = statsToFind;

  return exports.mapReduce(hits, ['navigation'], options)
            .then(function (data) {
              return data.navigation;
            });
};

exports.findHostnames = function (hits) {
  return exports.mapReduce(hits, ['hostnames'])
            .then(function (data) {
              return data.hostnames;
            });
};

function shouldAddStream(name, fields) {
  return fields.indexOf(name) > -1;
}

/**
 * This is a cluster.
 *
 * Take hits data, convert to data that can be displayed to the user.
 */
exports.mapReduce = function (hits, fields, options) {
  var startTime = new Date();
  return Promise.attempt(function () {
    if (! options) options = {};
    options.which = fields;

    var stream = new StreamReduce(options);

    hits.forEach(stream.write.bind(stream));

    return stream.result();
  }).then(function (data) {
    data.processing_time = (new Date().getTime() - startTime.getTime());
    return data;
  });
};

function StreamReduce(options) {
  this.addedFilters = [];
  this.addedStreams = [];

  allFilters.forEach(function(Filter) {
    this.addedFilters.push(new Filter());
  }, this);

  var which = options.which;
  allStreams.forEach(function(Stream) {
    var name = Stream.prototype.name;
    if (shouldAddStream(name, which)) {
      this.addedStreams.push(new Stream(options[name]));
    }
  }, this);
}

StreamReduce.prototype.write = function(hit/*, encoding, callback*/) {
  this.addedFilters.forEach(function(filter) {
    filter.write(hit);
  });

  this.addedStreams.forEach(function(stream) {
    stream.write(hit);
  });
};

StreamReduce.prototype.end = function(chunk/*, encoding, callback*/) {
  this.addedStreams.forEach(function(stream) {
    stream.end(chunk);
  });
};

StreamReduce.prototype.result = function() {
  var data = {};

  this.addedStreams.forEach(function(stream) {
    data[stream.name] = stream.result();
  });

  return data;
};

exports.StreamReduce = StreamReduce;
