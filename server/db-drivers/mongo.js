/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const logger = require('../lib/logger');

var PageLoad;

exports.save = function (item, done) {
  connect(function (err) {
    if (err) return done(err);
    var pageLoad = createPageLoad(item);
    pageLoad.save(done);
  });
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

  connect(function (err) {
    if (err) return;
      logger.info("searching: %s", JSON.stringify(searchBy));
      PageLoad.find(searchBy, function (err, models) {
        var endTime = new Date();
        var duration = endTime.getDate() - startTime.getDate();
        logger.info('database query time for %s: %s ms',
                        JSON.stringify(searchBy), duration);
        if (err) {
          logger.error("Error while retreiving models: %s", String(err));
          return done(err);
        }

        done(null, models);
      });
    }
  );
};

exports.getByHostname = function (hostname, done) {
  exports.get({ hostname: hostname }, done);
};

exports.clear = function (done) {
  connect(function (err) {
    if (err) return done(err);

    PageLoad.find(function (err, models) {
      if (err) return done(err);

      models.forEach(function (model) {
        model.remove();
      });

      done(null);
    });
  });
};


const pageLoadSchema = new Schema({
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
  tags: [ String ]
});

pageLoadSchema.plugin(mongooseTimestamps);

PageLoad = mongoose.model('PageLoad', pageLoadSchema);


function createPageLoad(data) {
  var pageLoad = new PageLoad(data);
  return pageLoad;
}


var connected = false;
var connectionError;
function connect(done) {
  if (connectionError) return done(connectionError);
  if (connected) return done(null);

  mongoose.connect('mongodb://localhost/test');
  var db = mongoose.connection;

  db.on('error', function (err) {
    logger.error('Error connecting to database: %s', String(err));

    connectionError = err;
    done(err);
  });

  db.once('open', function callback() {
    logger.info('Connected to database');

    connected = true;
    done(null, db);
  });
}

