/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const ROUTES_DIR = path.join(__dirname, '..', 'routes');

module.exports = require('rum-diary-server-common').router({
  cwd: ROUTES_DIR
});
