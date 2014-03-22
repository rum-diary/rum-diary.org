/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('../lib/logger');

var PageView = require('./mongo/page_view');
var Site = require('./mongo/site');
var User = require('./mongo/user');
var Tags = require('./mongo/tags');

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
  pipe: PageView.pipe.bind(PageView),
  getOne: PageView.getOne.bind(PageView),
  calculate: PageView.calculate.bind(PageView),
  getByHostname: function (hostname, done) {
    return PageView.get({ hostname: hostname }, done);
  },
  clear: PageView.clear.bind(PageView)
};


exports.user = {
  create: User.create.bind(User),
  update: User.update.bind(User),
  get: User.get.bind(User),
  getStream: User.getStream.bind(User),
  pipe: User.pipe.bind(User),
  getOne: User.getOne.bind(User),
  clear: User.clear.bind(User)
};

exports.site = {
  create: Site.create.bind(Site),
  update: Site.update.bind(Site),
  get: Site.get.bind(Site),
  getStream: Site.getStream.bind(Site),
  pipe: User.pipe.bind(User),
  getOne: Site.getOne.bind(Site),
  calculate: Site.calculate.bind(Site),
  clear: Site.clear.bind(Site),
  hit: Site.hit.bind(Site),
  ensureExists: Site.ensureExists.bind(Site)
};

exports.tags = {
  create: Tags.create.bind(Tags),
  update: Tags.update.bind(Tags),
  get: Tags.get.bind(Tags),
  getStream: Tags.getStream.bind(Tags),
  pipe: Tags.pipe.bind(Tags),
  getOne: Tags.getOne.bind(Tags),
  calculate: Tags.calculate.bind(Tags),
  clear: Tags.clear.bind(Tags),
  hit: Tags.hit.bind(Tags),
  ensureExists: Tags.ensureExists.bind(Tags)
};

