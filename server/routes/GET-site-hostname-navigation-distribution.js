/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const getQuery = require('../lib/site-query');
const logger = require('../lib/logger');

exports.path = '/site/:hostname/navigation/distribution';
exports.verb = 'get';

exports.handler = function (req, res) {
  var query = getQuery(req);

  db.pageView.get(query)
    .then(function (data) {
      return reduce.findNavigationTimingStats(data, ['distribution'], { bucket_precision: 25 });
    }).then(function (stats) {
      res.send(stats);
    }, function (err) {
      logger.error('GET-site-hostname error: %s', String(err));
      res.send(500);
    });
};
