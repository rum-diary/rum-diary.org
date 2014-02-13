/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const reduce = require('../lib/reduce');
const logger = require('../lib/logger');

exports.path = '/site';
exports.verb = 'get';

exports.handler = function(req, res) {
  db.site.get({})
    .then(function(sites) {
      var hostnames = sites.map(function(site) {
                        return site.hostname;
                      });

      res.render('GET-site-index.html', {
        sites: hostnames
      });
    })
    .then(null, function(err) {
      logger.error('DB.get error', String(err));
      res.send(500);
    });
};
