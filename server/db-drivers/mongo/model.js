/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const logger = require('../../lib/logger');


exports.create = function (name, definition) {
  const schema = new Schema(definition);
  schema.plugin(mongooseTimestamps);
  const Model = mongoose.model(name, schema);

  this.name = name;
  this.Model = Model;
};

exports.save = function (item, done) {
  /*console.log('saving item: %s', JSON.stringify(item));*/
  var model = this.createModel(item);
  return model.save(done);
};

exports.get = function (searchBy) {
  var startTime = new Date();
  var name = this.name;

  searchBy = this.getSearchBy(searchBy);

  logger.info('%s search: %s', name, JSON.stringify(searchBy));
  return this.Model.find(searchBy).exec().then(function(models) {
    computeDuration();
    return models;
  })
  .then(null, function(err) {
    computeDuration();
    logger.error('%s: Error while retreiving models: %s', name, String(err));
    throw err;
  });

  function computeDuration() {
    var endTime = new Date();
    var duration = endTime.getDate() - startTime.getDate();
    logger.info('%s: query time for %s: %s ms',
                    name, JSON.stringify(searchBy), duration);
  }
};

exports.clear = function (done) {
  return this.Model.find(function (err, models) {
    if (err) return done(err);

    models.forEach(function (model) {
      model.remove();
    });

    done(null);
  });
};


exports.createModel = function(data) {
  var model = new this.Model(data);
  return model;
}

