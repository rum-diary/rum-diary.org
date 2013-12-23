/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logger = require('../lib/logger');

var PageLoad;

exports.save = function(item, done) {
  connect(function(err) {
    if (err) return;

    var pageLoad = createPageLoad(item);
    pageLoad.save(done);
  });
};

exports.get = function(done) {
  connect(function(err) {
    if (err) return;

    PageLoad.find(done);
  });
};

exports.clear = function(done) {
  connect(function(err) {
    if (err) return;

    PageLoad.find(function(err, models) {
      if (err) return done(err);

      models.forEach(function(model) {
        model.remove();
      });

      done(null);
    });
  });
};


const pageLoadSchema = new Schema({
  uuid: String,
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
  ]
});

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

  db.on('error', function(err) {
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

