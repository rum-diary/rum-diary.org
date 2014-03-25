/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');

exports.path = '/site/:hostname/demographics';
exports.verb = 'get';
exports.template = 'GET-site-hostname-demographics.html';
exports['js-resources'] = clientResources('rum-diary.min.js');
exports.authorization = require('../lib/page-authorization').CAN_READ_HOST;

exports.handler = function(req) {
  var reduceStream = new reduce.StreamReduce({
    which: [
      'browsers',
      'os',
      'os:form'
    ],
    start: req.start,
    end: req.end
  });

  return db.pageView.pipe(req.dbQuery, null, reduceStream)
    .then(function(result) {
      reduceStream.end();
      reduceStream = null;
      return {
        hostname: req.params.hostname,
        startDate: req.start.format('MMM DD'),
        endDate: req.end.format('MMM DD'),
        browsers: result.browsers,
        os: result.os,
        os_form: result['os:form']
      };
    });
};

