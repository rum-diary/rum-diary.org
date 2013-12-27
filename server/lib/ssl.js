/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Read the SSL Key and Certificate.

const path = require('path');
const fs = require('fs');

const config = require('./config');

const SSL_KEY_PATH =
                path.join(config.get('ssl_cert_dir'), 'rum-diary.org.key');
const SSL_CERT_PATH =
                path.join(config.get('ssl_cert_dir'), 'rum-diary.org.bundle');

exports.getKey = function() {
  return fs.readFileSync(SSL_KEY_PATH);
};

exports.getCert = function() {
  return fs.readFileSync(SSL_CERT_PATH);
};

