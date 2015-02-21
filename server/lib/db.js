/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Loads up the database. Exports https://github.com/rum-diary/rum-diary-db-mongo
 *
 * @Class DB
 */
const common = require('rum-diary-server-common');

module.exports = function (config) {
  return common.db(common.configAdapter(config, 'mongo'));
};

