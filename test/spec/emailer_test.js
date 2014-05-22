/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, it*/

const assert = require('chai').assert;
const emailer = require('../../server/lib/emailer');

describe('emailer', function() {
  describe('send', function () {
    it('sends emails', function () {
      return emailer.send('dropontheground@testuser.com', 'subject', 'html email', 'text email')
        .then(function (status) {
          assert.ok(status.messageId);
        });
    });
  });
});


