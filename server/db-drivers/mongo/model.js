/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// generic model. basic CRUD operations.

const moment = require('moment');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const GET_FETCH_COUNT_WARNING_THRESHOLD = 500;

const logger = require('../../lib/logger');


exports.init = function (name, definition) {
  const schema = new Schema(definition);

  schema.plugin(mongooseTimestamps);

  const Model = mongoose.model(name, schema);

  this.name = name;
  this.Model = Model;
};

/**
 * Create and save a model from a data item
 */
exports.create = function (item) {
  var model = this.createModel(item);
  return this.update(model);
};

/**
 * save an already created model to the database. A slight misnomer for the
 * sake of understandability. Most of the time, update should only be called by
 * consumers of the API to update a model. create will call update to save the
 * initial version of the model to the database.
 * If the item is not yet converted to a model, use create instead.
 */
exports.update = withDatabase(function (model) {
  var resolver = Promise.defer();

  if (! model.save) {
    return resolver.reject('attempting to save an item that is not a model. Try create instead.');
  }

  model.save(function(err, model) {
    if (err) {
      return resolver.reject(err);
    }

    resolver.fulfill(model);
  });

  return resolver.promise;
});

exports.get = withDatabase(function (searchBy, fields) {
  // use a streaming get. Getting large data sets from the dB
  // uses a boatload of heap, generating your own collection
  // is much more efficient.
  return this.getStream(searchBy, fields)
             .then(function (stream) {
                var resolver = Promise.defer();

                var models = [];
                stream.on('data', function (chunk) {
                  models.push(chunk);
                });
                stream.on('err', function(err) {
                  resolver.reject(err);
                });
                stream.on('close', function () {
                  if (models.length > GET_FETCH_COUNT_WARNING_THRESHOLD) {
                    logger.warn('Using model.get for large data sets is ' +
                                'heap inefficient. Use getStream instead.');
                  }
                  resolver.fulfill(models);
                });

               return resolver.promise;
             });
});

exports.getStream = withDatabase(function (searchBy, fields) {
  if ( ! fields && typeof searchBy === 'string') {
    fields = searchBy;
    searchBy = {};
  }

  if (!searchBy) searchBy = {};

  var startTime = new Date();
  var name = this.name;

  searchBy = this.getSearchBy(searchBy);

  logger.info('%s->getStream: %s', name, JSON.stringify(searchBy));

  var stream = this.Model.find(searchBy, fields).stream();

  stream.on('err', function(err) {
    computeDuration();
    logger.error('%s->getStream error: %s', name, String(err));
  });

  stream.on('close', computeDuration);

  return stream;

  function computeDuration() {
    var endTime = new Date();
    var duration = endTime.getDate() - startTime.getDate();
    logger.info('%s->get query time for %s: %s ms',
                    name, JSON.stringify(searchBy), duration);
  }
});

exports.pipe = function(searchBy, fields, reduceStream) {
  return this.getStream(searchBy, fields)
              .then(function(stream) {
                var resolver = Promise.defer();

                stream.on('data', reduceStream.write.bind(reduceStream));

                stream.on('close', function () {
                  resolver.resolve(reduceStream.result());
                });

                stream.on('err', function (err) {
                  resolver.reject(err);
                });

                return resolver.promise;
              });
};

exports.getOne = withDatabase(function (searchBy) {
  var startTime = new Date();
  var name = this.name;

  searchBy = this.getSearchBy(searchBy);

  logger.info('%s->getOne: %s', name, JSON.stringify(searchBy));
  return this.Model.findOne(searchBy).exec().then(function(model) {
    computeDuration();
    return model;
  })
  .then(null, function(err) {
    computeDuration();
    logger.error('%s->getOne error: %s', name, String(err));
    throw err;
  });

  function computeDuration() {
    var endTime = new Date();
    var duration = endTime.getDate() - startTime.getDate();
    logger.info('%s->getOne query time for %s: %s ms',
                    name, JSON.stringify(searchBy), duration);
  }
});

exports.clear = withDatabase(function () {
  logger.warn('clearing table: %s', this.name);
  var resolver = Promise.defer();

  this.Model.remove(function (err) {
    if (err) {
      return resolver.reject(err);
    }

    resolver.fulfill();
  });

  return resolver.promise;
});

exports.getSearchBy = function (searchBy) {
  return searchBy;
};


exports.createModel = function(data) {
  var model = new this.Model(data);
  return model;
};

function withDatabase(op) {
  return function () {
    var args = [].slice.call(arguments, 0);
    var self = this;
    return connect().then(function() {
      return op.apply(self, args);
    });
  };
}

var connectionResolver;
function connect() {
  if (connectionResolver) {
    return connectionResolver.promise;
  }

  connectionResolver = Promise.defer();

  mongoose.connect('mongodb://localhost/test');
  var db = mongoose.connection;

  db.on('error', function (err) {
    logger.error('Error connecting to database: %s', String(err));

    connectionResolver.reject(err);
  });

  db.once('open', function callback() {
    logger.info('Connected to database');

    connectionResolver.fulfill();
  });

  return connectionResolver.promise;
}

