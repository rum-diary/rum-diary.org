/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nunjucks = require('nunjucks');
const moment = require('moment');
const cachify = require('connect-cachify');
const path = require('path');

const config = require('./config');

function getNunjucksConfig(app) {
  // Template setup.
  var nunjucksConfig = {
    autoescape: true
  };

  if (app) {
    nunjucksConfig.express = app;
  }

  return nunjucksConfig;
}

exports.setup = function (app) {
  var nunjucksConfig = getNunjucksConfig(app);
  var templateRoot = path.join(config.get('views_root'), config.get('views_dir'));
  var env = nunjucks.configure(templateRoot, nunjucksConfig);

  // sets up a filter to use in the templates that allows for cachifying.
  env.addFilter('cachify', function(str) {
    if (config.get('strong_http_caching')) return cachify.cachify(str);
    return str;
  });

  // Add the ability to convert dates using moment.
  env.addFilter('dateFormat', function(date, format) {
    return moment(new Date(date)).format(format);
  });

  return env;
};


