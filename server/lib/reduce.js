/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const logger = require('./logger');

const OSStream = require('./reduce/os');
const FormFactorStream = require('./reduce/form-factor');
const TagsStream = require('./reduce/tags');
const BrowserStream = require('./reduce/browser');
const HostnameStream = require('./reduce/hostname');
const HitsPerPageStream = require('./reduce/hits-per-page');
const ReferrerStream = require('./reduce/referrer');
const UniqueStream = require('./reduce/unique-visitor');
const ReturningStream = require('./reduce/returning-visitor');
const HitsPerDayStream = require('./reduce/hits-per-day');
const NavigationStream = require('./reduce/navigation');

var AvailableStreams = [
  OSStream,
  FormFactorStream,
  TagsStream,
  BrowserStream,
  HostnameStream,
  HitsPerPageStream,
  ReferrerStream,
  UniqueStream,
  ReturningStream,
  HitsPerDayStream,
  NavigationStream
];

// keep this around to facilitate debugging memory leaks when needed.
if (false) {
  const memwatch = require('memwatch');
  memwatch.on('leak', function (info) {
    logger.error('memory leak: %s', JSON.stringify(info, null, 2));
  });
  memwatch.on('stats', function (info) {
    logger.warn('memory stats: %s', JSON.stringify(info, null, 2));
  });
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
  this.addedStreams = [];

  var which = options.which;
  AvailableStreams.forEach(function(Stream) {
    if (shouldAddStream(Stream.prototype.name, which)) {
      this.addedStreams.push(new Stream(options));
    }
  }, this);
}

StreamReduce.prototype.write = function(hit) {
  this.addedStreams.forEach(function(stream) {
    stream.write(hit);
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
