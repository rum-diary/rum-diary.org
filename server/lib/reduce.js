/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.pageHitsPerDay = function(hitsForHost, done) {
  var paths = {};

  hitsForHost.forEach(function(item) {
    var path = item.path;

    if ( ! (path in paths)) {
      paths[path] = {};
    }

    var date = moment(item.createdAt).format('YYYY-MM-DD');

    if ( ! (date in paths[path])) {
      paths[path][date] = 0;
    }

    paths[path][date]++;
  });
  done(null, paths);
};

