/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const logger = require('../lib/logger');

exports.path = '/site';
exports.verb = 'get';

exports.handler = function(req, res) {
  db.get(function(err, data) {
    if (err) {
      return logger.error('DB.get error', String(err));
    }

    reduce.findHostnames(data, function(err, sites) {
      if (err) {
        return logger.error('reduce.findHostnames error', String(err));
      }

      res.render('GET-site-index.html', {
        sites: Object.keys(sites)
      });
    });
  });
};
