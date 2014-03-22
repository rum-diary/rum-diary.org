/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = {
  hostname: {
    format: String,
    'default': undefined
  },
  http_port: {
    format: 'port',
    'default': 80,
    env: 'HTTP_PORT'
  },
  https_port: {
    format: 'port',
    'default': 443,
    env: 'HTTPS_PORT'
  },
  ssl: {
    format: Boolean,
    'default': true
  },
  spdy: {
    format: Boolean,
    'default': true
  },
  env: {
    doc: 'What environment are we running in?  Note: all hosted environments are \'production\'.',
    format: ['production', 'development', 'test'],
    'default': 'production',
    env: 'NODE_ENV'
  },
  views_dir: path.join(__dirname, '..', 'views'),
  static_root: path.join(__dirname, '..', '..', 'client'),
  static_dir: {
    doc: 'Which static root to use for client side resources, select \'\' for testing',
    format: ['src', 'dist', ''],
    'default': 'dist'
  },
  config_dir: path.join(__dirname, '..', 'etc'),
  var_dir: path.join(__dirname, '..', 'var'),
  ssl_cert_dir: path.join(__dirname, '..', '..', '..', 'ssl'),
  logging_dir: {
    doc: 'Where log files should be stored',
    format: String,
    'default': path.join(__dirname, '..', 'var', 'log')
  },
  data_collection_server: {
    doc: 'Server where clients should send performance data',
    format: String,
    'default': 'https://rum-diary.org'
  },
  use_concatenated_resources: {
    doc: 'Whether to use concatenated resources.',
    format: Boolean,
    'default': true
  },
  strong_http_caching: {
    doc: 'Add strong HTTP caching to resources.',
    format: Boolean,
    'default': true
  },
  verify_assertion: {
    doc: 'Whether to verify the assertion',
    format: Boolean,
    'default': true
  },
  noverify_email: {
    doc: 'The email address returned by the verifier if verify_assertion is set to false',
    format: String,
    'default': 'testuser@testuser.com'
  },

  proc_name: getProcName()
};

function getProcName() {
  return path.basename(process.argv[1], '.js');
}


