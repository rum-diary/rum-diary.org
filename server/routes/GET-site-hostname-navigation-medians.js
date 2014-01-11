/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const getQuery = require('../lib/site-query');

exports.path = '/site/:hostname/navigation/medians';
exports.verb = 'get';

exports.handler = function(req, res) {
  var query = getQuery(req);

  db.get(query, function(err, data) {
    if (err) return res.send(500);

    reduce.findMedianNavigationTimes(data, function(err, medians) {
      if (err) return res.send(500);
      res.send(medians);
    });
  });
};
