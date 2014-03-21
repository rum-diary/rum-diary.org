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
  var resolver = Promise.defer();

  if (! VERIFY_ASSERTION) {
    resolver.resolve(NOVERIFY_EMAIL);
  } else {
    logger.info('verifying assertion: %s', AUDIENCE);
    verify(assertion, AUDIENCE, function (err, email, response) {
      if (err) {
        return verificationFailure(resolver, String(err));
      } else if (response.status === 'failure') {
        return verificationFailure(resolver, response.reason);
      }

      logger.info('verification successful');
      resolver.resolve(email);
    });
  }

  return resolver.promise;

};

function verificationFailure(resolver, reason) {
  logger.error('verification error: %s', reason);
  resolver.reject(reason);
}

