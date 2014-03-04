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
var Site = require('./mongo/site');
var User = require('./mongo/user');
var Tags = require('./mongo/tags');

function deprecated(oldName, newName, callback) {
  return function() {
    logger.warn('mongo.js->:%s is deprecated, please use %s', oldName, newName);
    return callback.apply(null, arguments);
  };
}

exports.save = deprecated('save', 'pageView.create', PageView.create.bind(PageView));
exports.get = deprecated('get', 'pageView.get', PageView.get.bind(PageView));
exports.getStream = deprecated('getStream', 'pageView.getStream', PageView.getStream.bind(PageView));
exports.getOne = deprecated('getOne', 'pageView.getOne', PageView.getOne.bind(PageView));
exports.clear = function(done) {
  logger.warn('clearing database');
  return PageView.clear()
    .then(function() {
      return User.clear();
    })
    .then(function() {
      return Site.clear();
    })
    .then(function() {
      return Tags.clear();
    })
    .then(function() {
      if (done) done(null);
    });
};

exports.pageView = {
  create: PageView.create.bind(PageView),
  update: PageView.update.bind(PageView),
  get: PageView.get.bind(PageView),
  getStream: PageView.getStream.bind(PageView),
  getOne: PageView.getOne.bind(PageView),
  getByHostname: function (hostname, done) {
    return PageView.get({ hostname: hostname }, done);
  },
  clear: PageView.clear.bind(PageView)
};

exports.getByHostname = deprecated('getByHostname', 'pageView.getByHostname', exports.pageView.getByHostname);


exports.user = {
  create: User.create.bind(User),
  update: User.update.bind(User),
  get: User.get.bind(User),
  getStream: User.getStream.bind(User),
  getOne: User.getOne.bind(User),
  clear: User.clear.bind(User)
};

exports.site = {
  create: Site.create.bind(Site),
  update: Site.update.bind(Site),
  get: Site.get.bind(Site),
  getStream: Site.getStream.bind(Site),
  getOne: Site.getOne.bind(Site),
  clear: Site.clear.bind(Site),
  hit: Site.hit.bind(Site),
  ensureExists: Site.ensureExists.bind(Site)
};

exports.tags = {
  create: Tags.create.bind(Tags),
  update: Tags.update.bind(Tags),
  get: Tags.get.bind(Tags),
  getStream: Tags.getStream.bind(Tags),
  getOne: Tags.getOne.bind(Tags),
  clear: Tags.clear.bind(Tags),
  hit: Tags.hit.bind(Tags),
  ensureExists: Tags.ensureExists.bind(Tags)
};

