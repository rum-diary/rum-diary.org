/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Ensure a pageView contains both a referrer_hostname and referrer_path.
 * Calculate if necessary.
 */

/**
 * TODO - investigate node Transform streams to do this.
 */
const url = require('url');

function Filter() {
  // nothing to do.
}

Filter.prototype.write = function(chunk, encoding, callback) {
  if (chunk.referrer_hostname && chunk.referrer_path) return;
  if (! chunk.referrer) return;

  try {
    // XXX Better to do is to check referrers when
    // the data comes in.
    var parsed = url.parse(chunk.referrer);
    chunk.referrer_hostname = parsed.hostname;
    chunk.referrer_path = parsed.path || '/';
  } catch(e) {
    return;
  }

  if (callback(null, chunk));
};

Filter.prototype.end = function () {
  // nothing to do
};

module.exports = Filter;
