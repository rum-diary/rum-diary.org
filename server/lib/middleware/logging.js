/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Send all express logs to our custom logger.
const morgan = require('morgan');

const logger = require('../logger');

module.exports = function () {
  return morgan('tiny', {
    stream: {
      write: function(x) {
        logger.info(typeof x === 'string' ? x.trim() : x);
      }
    }
  });
};

