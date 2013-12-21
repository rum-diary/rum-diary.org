/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'var', 'db.json');

var data;
function load(done) {
  if (data) return done(null);

  fs.readFile(DB_PATH, function(err, fileData) {
    if (err) return done(err);

    try {
      data = JSON.parse(fileData);
    } catch(e) {
      data = {};
    }

    done(null);
  });
}

exports.save = function(item, done) {
  load(function(err) {
    if (err) return done(err);

    data[item.uuid] = item;
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

