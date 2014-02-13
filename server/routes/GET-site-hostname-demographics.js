/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const logger = require('../lib/logger');
const db = require('../lib/db');
const reduce = require('../lib/reduce');
const clientResources = require('../lib/client-resources');
const getQuery = require('../lib/site-query');

exports.path = '/site/:hostname/demographics';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);
  var start = moment(query.createdAt.$gte);
  var end = moment(query.createdAt.$lte);

  db.pageView.get(query)
    .then(function(hits) {
      return reduce.mapReduce(hits, [
        'browsers',
        'os',
        'os:form'
      ], {
        start: start,
        end: end
      });
    })
    .then(function(data) {
      logger.info('os data', JSON.stringify(data.os));
      res.render('GET-site-hostname-demographics.html', {
        hostname: req.params.hostname,
        resources: clientResources('rum-diary.min.js'),
        startDate: start.format('MMM DD'),
        endDate: end.format('MMM DD'),
        browsers: data.browsers,
        os: data.os,
        os_form: data['os:form']
      });
    }).catch(function(err) {
      logger.error(String(err));
      res.send(500);
    });
};

