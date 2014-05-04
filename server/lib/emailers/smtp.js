/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nodemailer = require('nodemailer');
const config = require('../config');

module.exports = nodemailer.createTransport('SMTP', {
  host: config.get('emailer.smtp.host'),
  secureConnection: config.get('emailer.smtp.useSecureConnection'),
  port: config.get('emailer.smtp.port')
});

