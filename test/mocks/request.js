/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (options) {
  var self = this;
  this.url = options.url;
  this.method = options.method;
  this.body = JSON.stringify(options.data);
  this.headers = options.headers || {};

  this.get = function (headerName) {
    return self.headers[headerName];
  };
};

