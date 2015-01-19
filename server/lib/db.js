/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Loads up the database. Exports https://github.com/rum-diary/rum-diary-db-mongo
 *
 * @Class DB
 */
const config = require('./config');

const dbConfig = {
  get: function (name) {
    return config.get('mongo.' + name);
  }
};

const MongoAdapter = require('rum-diary-db-mongo');

const db = Object.create(MongoAdapter);
db.init(dbConfig);

module.exports = db;
