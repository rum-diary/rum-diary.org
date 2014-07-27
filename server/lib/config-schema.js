/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = {
  hostname: {
    format: String,
    'default': undefined
  },
  public_url: {
    format: String,
    'default': undefined
  },
  http_port: {
    format: 'port',
    'default': 80,
    env: 'HTTP_PORT'
  },
  ssl: {
    format: Boolean,
    'default': true
  },
  env: {
    doc: 'What environment are we running in?  Note: all hosted environments are \'production\'.',
    format: ['production', 'development', 'test'],
    'default': 'production',
    env: 'NODE_ENV'
  },
  views_root: path.join(__dirname, '..', 'views'),
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
  session_cookie_name: {
    doc: 'The name of the session cookie',
    format: String,
    'default': 'sessionId'
  },
  session_duration_ms: {
    doc: 'Session duration',
    format: Number,
    'default': 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  session_cookie_secret: {
    doc: 'Session cookie secret',
    format: String,
    'default': 'wild and crazy cats',
    env: 'SESSION_COOKIE_SECRET'
  },

  emailer: {
    sending_user: {
      doc: 'The user emails are addressed from',
      format: String,
      'default': 'noresponse'
    },
    transport: {
      doc: 'Type of transport to use',
      format: ['sendmail', 'smtp', 'console'],
      'default': 'sendmail'
    },
    smtp: {
      host: {
        doc: 'Outgoing email server',
        format: String,
        'default': '127.0.0.1'
      },
      useSecureConnection: {
        doc: 'Whether to use an SSL connection to the email server',
        format: Boolean,
        'default': false
      },
      port: {
        doc: 'Port to send email',
        format: 'port',
        'default': 9999
      }
    },
  },

  logging: {
    level: {
      doc: 'Minimum level to log',
      format: ['TRACE', 'VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'],
      'default': 'DEBUG'
    },
    handlers: {
      doc: 'Handlers to user',
      format: Array,
      'default': ['console', 'file']
    }
  },

  mongo: {
    databaseURI: {
      doc: 'Mongo database URI',
      format: String,
      'default': 'mongodb://localhost/rum-diary-test',
      env: 'MONGO_DB_URI'
    },
    user: {
      doc: 'Mongo username',
      format: String,
      'default': undefined,
      env: 'MONGO_USER'
    },
    password: {
      doc: 'Mongo password',
      format: String,
      'default': undefined,
      env: 'MONGO_PASS'
    }
  },

  proc_name: getProcName()
};

function getProcName() {
  return path.basename(process.argv[1], '.js');
}


