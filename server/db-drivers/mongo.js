/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const logger = require('../lib/logger');

var PageView = require('./mongo/page_view');
var Site = require('./mongo/site');
var User = require('./mongo/user');
var Tags = require('./mongo/tags');
var Invite = require('./mongo/invite');
var Annotation = require('./mongo/annotation');

exports.clear = function(done) {
  logger.warn('clearing database');
  return Promise.all([
    PageView.clear(),
    User.clear(),
    Site.clear(),
    Tags.clear(),
    Invite.clear(),
    Annotation.clear()
  ]).then(function() {
    if (done) done(null);
  });
};

exports.pageView = PageView;
exports.pageView.getByHostname = function (hostname, done) {
  return PageView.get({ hostname: hostname }, done);
};


exports.user = User;
exports.site = Site;
exports.tags = Tags;
exports.invite = Invite;
exports.annotation = Annotation
