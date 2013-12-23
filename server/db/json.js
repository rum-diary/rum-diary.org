/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const config = require('../lib/config');

const DB_PATH = path.join(config.get('var_dir'), 'db.json');

if ( ! fs.existsSync(DB_PATH)) {
  var fd = fs.openSync(DB_PATH, 'w', '600');
  fs.closeSync(fd);
}

var data;
function load(done) {
  if (data) return done(null);

  fs.readFile(DB_PATH, function(err, fileData) {
    if (err) return done(err);

    try {
      data = JSON.parse(fileData);
    } catch(e) {
      data = [];
    }

    done(null);
  });
}

exports.save = function(item, done) {
  load(function(err) {
    if (err) return done(err);

    data.push(item);
    fs.writeFile(DB_PATH, JSON.stringify(data), {
      encoding: 'utf8'
    }, done);
  });
};

exports.get = function(done) {
  load(function(err) {
    if (err) return done(err);

    done(null, data);
  });
};


exports.clear = function(done) {
  load(function(err) {
    if (err) return done(err);

    data = null;
    fs.writeFile(DB_PATH, '', {
      encoding: 'utf8'
    }, done);
  });
};
