/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const logger = require('../lib/logger');

var PageView;

exports.save = function (item, done) {
  /*console.log("saving item: %s", JSON.stringify(item));*/
  connect().then(function () {
    var pageView = createPageView(item);
    pageView.save(done);
  })
  .then(null, done);
};

exports.get = function (searchBy, done) {
  var startTime = new Date();
  if ( ! done && typeof searchBy === "function") {
    done = searchBy;
    searchBy = {};
  }

  // default to a 30 day search unless overridden.
  if ( ! searchBy.updatedAt) {
    searchBy.updatedAt = {
      $gte: moment().subtract('days', 30).toDate()
    };
  }

  if (searchBy.tags) {
    // If the $all is not specified, then it matches tags in order
    searchBy.tags = {
      $all: searchBy.tags
    };
  }

  return connect().then(function() {
    logger.info("searching: %s", JSON.stringify(searchBy));
    var query = PageView.find(searchBy);
    return query.exec();
  })
  .then(function(models) {
    computeDuration();
    if (done) done(null, models);
    return models;
  })
  .then(null, function(err) {
    computeDuration();
    logger.error("Error while retreiving models: %s", String(err));
    if (done) done(err);
    throw err;
  });

  function computeDuration() {
    var endTime = new Date();
    var duration = endTime.getDate() - startTime.getDate();
    logger.info('database query time for %s: %s ms',
                    JSON.stringify(searchBy), duration);
  }
};

exports.getByHostname = function (hostname, done) {
  exports.get({ hostname: hostname }, done);
};

exports.clear = function (done) {
  connect().then(function() {
    PageView.find(function (err, models) {
      if (err) return done(err);

      models.forEach(function (model) {
        model.remove();
      });

      done(null);
    });
  }).then(null, done);
};


const pageViewSchema = new Schema({
  uuid: String,
  hostname: String,
  path: String,
  referrer: String,
  referrer_hostname: String,
  referrer_path: String,
  os: String,
  browser: {
    family: String,
    major: Number,
    minor: Number
  },
  navigationTiming: {
    'navigationStart': Number,
    'unloadEventStart': Number,
    'unloadEventEnd': Number,
    'redirectStart': Number,
    'redirectEnd': Number,
    'fetchStart': Number,
    'domainLookupStart': Number,
    'domainLookupEnd': Number,
    'connectStart': Number,
    'connectEnd': Number,
    'secureConnectionStart': Number,
    'requestStart': Number,
    'responseStart': Number,
    'responseEnd': Number,
    'domLoading': Number,
    'domInteractive': Number,
    'domContentLoadedEventStart': Number,
    'domContentLoadedEventEnd': Number,
    'domComplete': Number,
    'loadEventStart': Number,
    'loadEventEnd': Number
  },
  timers: Schema.Types.Mixed,
  events: [
    {
      type: String,
      timestamp: Number
    }
  ],
  tags: [ String ],
  returning: Boolean
});

pageViewSchema.plugin(mongooseTimestamps);

PageView = mongoose.model('PageView', pageViewSchema);


function createPageView(data) {
  var pageView = new PageView(data);
  return pageView;
}


var connectionResolver = Promise.defer();
var connectionResolved = false;
function connect() {
  if (connectionResolved) {
    return connectionResolver.promise;
  }

  mongoose.connect('mongodb://localhost/test');
  var db = mongoose.connection;

  db.on('error', function (err) {
    logger.error('Error connecting to database: %s', String(err));

    connectionResolved = true;
    connectionResolver.reject(err);
  });

  db.once('open', function callback() {
    logger.info('Connected to database');

    connectionResolved = true;
    connectionResolver.fulfill();
  });

  return connectionResolver.promise;
}

