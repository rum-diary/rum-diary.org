/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');

const https = require('https');
const agent = new https.Agent();
agent.maxSockets = 1000000;

const verify = require('browserid-verify')({
  type: 'remote',
  agent: agent
});
const config = require('./config');
const logger = require('./logger');

const VERIFY_ASSERTION = config.get('verify_assertion');
const NOVERIFY_EMAIL = config.get('noverify_email');
const AUDIENCE = config.get('hostname');

exports.verify = function (assertion) {
  return new Promise(function (fulfill, reject) {
    if (! VERIFY_ASSERTION) {
      logger.warn('not verifying assertion, returning %s as email', NOVERIFY_EMAIL);
      fulfill(NOVERIFY_EMAIL);
    } else {
      logger.info('verifying assertion: %s', AUDIENCE);
      verify(assertion, AUDIENCE, function (err, email, response) {
        if (err) {
          return verificationFailure(reject, String(err));
        } else if (response.status === 'failure') {
          return verificationFailure(reject, response.reason);
        }

        logger.info('verification successful');
        fulfill(email);
      });
    }
  });
};

function verificationFailure(reject, reason) {
  logger.error('verification error: %s', reason);
  reject(reason);
}

