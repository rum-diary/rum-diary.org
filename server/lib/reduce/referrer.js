/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count referrers

const util = require('util');
const url = require('url');
const ThinkStats = require('think-stats');
const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

function Stream(options) {
  this._data = {
    by_hostname: {}
  };
  ReduceStream.call(this, options);
}

Stream.prototype.name = 'referrers';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  if ( ! (chunk.referrer_hostname && chunk.hostname)) return;

  // Do not count internal referrers
  if (chunk.referrer_hostname === chunk.hostname) return;

  var referrers = this._data.by_hostname;
  var referrerHostname = chunk.referrer_hostname;
  if ( ! referrers[referrerHostname]) {
    referrers[referrerHostname] = 0;
  }

  referrers[referrerHostname]++;

  callback(null);
};

Stream.prototype.result = function () {
  this._data.by_count = sortHostnamesByCount(this._data.by_hostname);
  return this._data;
};

function sortHostnamesByCount(countByHostname) {
  var sortedByCount = new ThinkStats({
    store_data: true,
    compare: function (a, b) {
      try {
        return b.count - a.count;
      } catch(e) {
        console.error('error comparing');
      }
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


module.exports = Stream;
