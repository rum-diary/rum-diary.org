/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count chunks per page

const util = require('util');
const ReduceStream = require('../reduce-stream');

util.inherits(HitsPerPageStream, ReduceStream);

function HitsPerPageStream(options) {
  this._data = {
    __all: 0
  };
  ReduceStream.call(this, options);
}

HitsPerPageStream.prototype.name = 'hits_per_page';
HitsPerPageStream.prototype.type = null;

HitsPerPageStream.prototype._write = function(chunk, encoding, callback) {
  this._data.__all++;

  var path = chunk.path;
  if ( ! path) return;

  if ( ! (path in this._data)) this._data[path] = 0;

  this._data[path]++;

  callback(null);
};

module.exports = HitsPerPageStream;
