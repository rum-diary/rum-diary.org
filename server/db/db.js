/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config');
const logger = require('../lib/logger');
const db = getDatabase();

exports.save = db.save;
exports.get = db.get;
exports.clear = db.clear;
exports.getByHostname = db.getByHostname;

function getDatabase() {
  var driver = config.get('database_driver');
  logger.info('Using %s database', driver);
  return require('./' + driver);
}

