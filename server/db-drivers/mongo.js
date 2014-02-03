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

exports.save = PageView.create.bind(PageView);
exports.get = PageView.get.bind(PageView);
exports.getOne = PageView.getOne.bind(PageView);
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

exports.getByHostname = function (hostname, done) {
  return exports.get({ hostname: hostname }, done);
};

exports.user = {
  create: User.create.bind(User),
  get: User.get.bind(User),
  getOne: User.getOne.bind(User),
  clear: User.clear.bind(User)
};

