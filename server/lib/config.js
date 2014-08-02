/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const convict = require('convict');
const path = require('path');
const fs = require('fs');

const schema = require('./config-schema');

var config = convict(schema);

useDevConfigIfNoneDefined();
loadConfigFiles();
setNodeEnv();

config.validate();

config.set('public_url', getPublicUrl());

module.exports = config;

function setNodeEnv() {
  if ( ! process.env.NODE_ENV) {
    process.env.NODE_ENV = config.get('env');
  }
}

function useDevConfigIfNoneDefined() {
  var DEV_CONFIG_PATH = path.join(config.get('config_dir'), 'local.json');
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
      console.log('loading config file', file);
    });
    config.loadFile(files);
  }
}

function getPublicUrl() {
  var hostname = config.get('hostname');
  var useSSL = config.get('ssl');
  var httpPort = config.get('http_port');

  var protocol = useSSL ? 'https' : 'http';
  var port = useSSL ? (httpPort === 443 ? '' : ':' + httpPort) :
                      (httpPort === 80 ? '' : ':' + httpPort);

  return protocol + '://' + hostname + port;
}
