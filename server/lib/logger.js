/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intel = require('intel');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('./config');

// TODO - we cannot include config.js here because there would be a
// circular dependency. UGH.
const LOGGING_DIR = path.join(__dirname, '..', 'var', 'log');
ensureLoggingDirExists();

const PROCESS_NAME = getProcName();
const LOGGING_FILE_PATH = path.join(LOGGING_DIR, PROCESS_NAME);

// 5 meg per log file max
const MAX_SIZE_IN_BYTES = 5 * 1024 * 1024;

var intelConfig = {
  formatters: {
    'console': {
      'format': '%(levelname)s %(name)s: %(message)s',
      'colorize': true
    },
    'file': {
      'format': '[%(date)s] %(levelname)s: %(message)s',
      'colorize': false
    }
  },
  handlers: {
    'console': {
      'class': intel.handlers.Console,
      formatter: 'console'
    },
    'file': {
      'class': intel.handlers.Rotating,
      formatter: 'file',
      file: LOGGING_FILE_PATH,
      maxSize: MAX_SIZE_IN_BYTES,
      maxFiles: 10
    }
  },
  // this will be set below.
  loggers: {}
};

intelConfig.loggers[PROCESS_NAME] = {
  level: config.get('logging.level'),
  handlers: config.get('logging.handlers'),
  propagate: false,
  handleExceptions: true,
  exitOnError: false
};

intel.config(intelConfig);

module.exports = intel.getLogger(PROCESS_NAME);


function ensureLoggingDirExists() {
  mkdirp.sync(LOGGING_DIR);
}

function getProcName() {
  return path.basename(process.argv[1], '.js');
}


