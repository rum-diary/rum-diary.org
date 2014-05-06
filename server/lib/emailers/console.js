/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

// Pipes all messages to stdout

function ConsoleTransport(options) {
  this.options = options;
}

ConsoleTransport.prototype.sendMail = function (emailMessage, callback) {
  var message = '';

  emailMessage.on('data', function (buffer) {
    message += buffer.toString();
  });

  emailMessage.on('error', function (err) {
    callback(err);
  });

  emailMessage.on('end', function () {
    logger.verbose(message);

    callback(null, {
      messageId: emailMessage._messageId
    });
  });
  emailMessage.streamMessage();
};

module.exports = nodemailer.createTransport(ConsoleTransport, {
  name: config.get('hostname')
});
