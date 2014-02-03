/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const logger = require('../lib/logger');

var PageView = require('./mongo/page_view');
/*
var Site = require('./mongo/site');
var User = require('./mongo/user');
*/

exports.save = function (item, done) {
  /*console.log("saving item: %s", JSON.stringify(item));*/
  return connect().then(function () {
    return PageView.save(item, done);
  });
};

exports.get = function (searchBy, done) {
  if ( ! done && typeof searchBy === 'function') {
    done = searchBy;
    searchBy = {};
  }

  return connect().then(function () {
    return PageView.get(searchBy);
  }).then(function(models) {
    if (done) done(null, models);
    return models;
  }).then(null, function(err) {
    if (done) done(err);
    throw err;
  });
};

exports.getByHostname = function (hostname, done) {
  return exports.get({ hostname: hostname }, done);
};

exports.clear = function (done) {
  return connect().then(function () {
    return PageView.clear(done);
  });
};


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

