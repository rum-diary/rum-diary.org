/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../../db/db');
const logger = require('../logger');
const reduce = require('../reduce');

exports.path = '/site/:hostname';
exports.verb = 'get';

const client_resources = require('../client-resources');

exports.handler = function(req, res) {
  var hostname = req.params.hostname;
  logger.info('get information for %s', hostname);
  db.getByHostname(hostname, function(err, data) {
    if (err) return res.send(500);

    var pageHitsPerDay = reduce.pageHitsPerDay(data);
    var pageHitsPerPage = reduce.pageHitsPerPage(data);

    var pageHitsPerPageSorted = sortPageHitsPerPage(pageHitsPerPage);

    res.render('GET-site-hostname.html', {
      hostname: req.params.hostname,
      resources: client_resources('rum-diary.min.js'),
      pageHitsPerPage: pageHitsPerPageSorted,
      pageHitsPerDay: pageHitsPerDay.__all
    });
  });

};

function sortPageHitsPerPage(pageHitsPerPage) {
  var sorted = Object.keys(pageHitsPerPage).map(function(key) {
    return {
      page: key,
      hits: pageHitsPerPage[key]
    };
  }).sort(function(a, b) {
    return b.hits - a.hits;
  });

  return sorted;
}
