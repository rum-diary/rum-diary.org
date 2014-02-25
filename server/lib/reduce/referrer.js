/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count referrers

const util = require('util');
const url = require('url');
const ThinkStats = require('think-stats');
const ReduceStream = require('../reduce-stream');

util.inherits(ReferrerStream, ReduceStream);

function ReferrerStream(options) {
  this._data = {
    by_hostname: {}
  };
  ReduceStream.call(this, options);
}

ReferrerStream.prototype.name = 'referrers';
ReferrerStream.prototype.type = null;

ReferrerStream.prototype._write = function(chunk, encoding, callback) {
  var referrers = this._data.by_hostname;
  if ( ! (chunk.referrer || chunk.referrer_hostname)) return;

  var hostname = chunk.referrer_hostname;
  if ( ! hostname) {
    try {
      // XXX this is exceptionally slow, check if all referrers have been
      // converted to hostnames and remove this.
      var parsed = url.parse(chunk.referrer);
      hostname = parsed.hostname;
    } catch(e) {
      return;
    }
  }

  if ( ! referrers[hostname]) {
    referrers[hostname] = 0;
  }

  referrers[hostname]++;

  callback(null);
};

ReferrerStream.prototype.result = function () {
  this._data.by_count = sortHostnamesByCount(this._data.by_hostname);
  return this._data;
};

function sortHostnamesByCount(countByHostname) {
  var sortedByCount = new ThinkStats({
    compare: function (a, b) {
      return b.count - a.count;
    }
  });

  Object.keys(countByHostname).forEach(function (hostname) {
    sortedByCount.push({
      hostname: hostname,
      count: countByHostname[hostname]
    });
  });

  return sortedByCount.sorted();
}


module.exports = ReferrerStream;
