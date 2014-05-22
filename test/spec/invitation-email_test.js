/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const config = require('../../server/lib/config');
const invitationEmail = require('../../server/lib/invitation-email');

const UNENCODED_TOKEN = 'this is a token';
const ENCODED_TOKEN = encodeURIComponent(UNENCODED_TOKEN);

describe('invitation-email', function() {
  describe('generateHtml', function () {
    it('creates HTML invitations', function () {
      var html = invitationEmail.generateHtml({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        token: UNENCODED_TOKEN
      });

      assert.isTrue(html.indexOf(config.get('public_url')) > -1);
      assert.isTrue(html.indexOf(ENCODED_TOKEN) > -1);
    });
  });

  describe('generateText', function () {
    it('creates text invitations', function () {
      var text = invitationEmail.generateHtml({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        token: UNENCODED_TOKEN
      });

      assert.isTrue(text.indexOf(config.get('public_url')) > -1);
      assert.isTrue(text.indexOf(ENCODED_TOKEN) > -1);
    });
  });
});


