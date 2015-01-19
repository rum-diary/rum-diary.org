/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const db = require('../lib/db');
const siteCollection = db.site;
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/demographics';
exports.method = 'get';
exports.template = 'GET-site-hostname-demographics.html';
exports.locals = {
  resources: clientResources('js/rum-diary.min.js')
};
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var pageViewQuery = req.dbQuery;
  pageViewQuery.hostname = req.params.hostname;

  var reduceStream = new reduce.StreamReduce({
    which: [
      'browsers',
      'os',
      'os:form'
    ],
    start: req.start,
    end: req.end
  });

  return Promise.all([
    siteCollection.isAuthorizedToAdministrate(req.session.email, req.params.hostname),
    db.pageView.pipe(pageViewQuery, null, reduceStream)
  ]).then(function(allResults) {
    var isAdmin = allResults[0];
    var demographicsResults = reduceStream.result();

    reduceStream.end();
    reduceStream = null;


    return {
      hostname: req.params.hostname,
      startDate: req.start.format('MMM DD'),
      endDate: req.end.format('MMM DD'),
      browsers: demographicsResults.browsers,
      os: demographicsResults.os,
      os_form: demographicsResults['os:form'],
      isAdmin: isAdmin
    };
  });
};

