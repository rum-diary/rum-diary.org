/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

function ResponseMock() {
}

ResponseMock.prototype = {
  json: function(status, body) {
    this.status = status;
    this.body = JSON.stringify(body);
  }
};


module.exports = ResponseMock;
