/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const convict = require('convict');
const path = require('path');
const fs = require('fs');

const logger = require('./logger');
const schema = require('./config-schema');

var conf = convict(schema);

useDevConfigIfNoneDefined();
loadConfigFiles();
setNodeEnv();

conf.validate();

module.exports = conf;

function setNodeEnv() {
  if ( ! process.env.NODE_ENV) {
    process.env.NODE_ENV = conf.get('env');
  }
}

function useDevConfigIfNoneDefined() {
  var DEV_CONFIG_PATH = path.join(conf.get('config_dir'), 'local.json');
  if ( ! process.env.CONFIG_FILES && fs.existsSync(DEV_CONFIG_PATH)) {
    process.env.CONFIG_FILES = DEV_CONFIG_PATH;
  }
}

function loadConfigFiles() {
  // handle configuration files.  you can specify a CSV list of configuration
  // files to process, which will be overlayed in order, in the CONFIG_FILES
  // environment variable
  if (process.env.CONFIG_FILES && process.env.CONFIG_FILES !== '') {
    var files = process.env.CONFIG_FILES.split(',');
    files.forEach(function(file) {
      logger.info('loading config file', file);
    });
    conf.loadFile(files);
  }
}


