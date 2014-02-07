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

function deprecated(oldName, newName, callback) {
  return function() {
    logger.warn('mongo.js->:%s is deprecated, please use %s', oldName, newName);
    return callback.apply(null, arguments);
  }
};

exports.save = deprecated('save', 'pageView.create', PageView.create.bind(PageView));
exports.get = deprecated('get', 'pageView.get', PageView.get.bind(PageView));
exports.getOne = deprecated('getOne', 'pageView.getOne', PageView.getOne.bind(PageView));
exports.clear = function(done) {
  return PageView.clear()
    .then(function() {
      return User.clear();
    })
    .then(function() {
      return Site.clear();
    })
    .then(function() {
      if (done) done(null);
    });
};

exports.pageView = {
  create: PageView.create.bind(PageView),
  update: PageView.update.bind(PageView),
  get: PageView.get.bind(PageView),
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
  getOne: User.getOne.bind(User),
  clear: User.clear.bind(User)
};

exports.site = {
  create: Site.create.bind(Site),
  update: Site.update.bind(Site),
  get: Site.get.bind(Site),
  getOne: Site.getOne.bind(Site),
  clear: Site.clear.bind(Site),
  hit: Site.hit.bind(Site)
};

