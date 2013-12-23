/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intel = require('intel');
const path = require('path');

var intelConfig = {
  formatters: {
    'console': {
      'format': '%(levelname)s %(name)s: %(message)s',
      'colorize': true
    }
  },
  handlers: {
    'console': {
      'class': 'intel/handlers/console',
      formatter: 'console'
    }
  },
  // this will be set below.
  loggers: {}
};

var procName = getProcName();
intelConfig.loggers[procName] = {
  level: 'DEBUG',
  handlers: ['console'],
  propagate: false,
  handleExceptions: true,
  exitOnError: false
};

intel.config(intelConfig);

module.exports = intel.getLogger(procName);


function getProcName() {
  return path.basename(process.argv[1], '.js');
}

