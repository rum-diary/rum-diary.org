/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;

const httpErrors = require('../server/lib/http-errors');


describe('http-errors', function () {
  it('should return an Error instance with httpError attribute', function () {
    var err = httpErrors.BadRequestError();
    assert.isTrue(err instanceof Error);
    assert.equal(err.httpError, 400);
    assert.equal(err.message, 'Bad Request');
  });
});

