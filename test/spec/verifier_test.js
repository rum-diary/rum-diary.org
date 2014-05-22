/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;

const verifier = require('../../server/lib/verifier');
const config = require('../../server/lib/config');

describe('verifier', function () {
  var origValue = config.get('verify_assertion');

  beforeEach(function () {
    config.set('verify_assertion', false);
  });

  afterEach(function () {
    config.set('verify_assertion', origValue);
  });

  it('verifies an assertion and returns a promise. Promise is fullfilled with email address', function (done) {
    verifier.verify('fake_assertion')
            .then(function (email) {
              assert.equal(email, 'testuser@testuser.com');
              done();
            });
  });
});

