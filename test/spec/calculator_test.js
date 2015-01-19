/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// tests for the calculator.

/*global describe, beforeEach, afterEach, it*/

const Promises = require('bluebird');
const mocha = require('mocha');
const assert = require('chai').assert;
const sinon = require('sinon');

const Calculator = require('../../server/lib/calculator');
const DbMock = {
  table_name: {
    calculate: function(outputStream, config) {
      // monkey patch the output stream
      sinon.stub(outputStream, 'result', function () {
        return config.value_to_return;
      });
      return Promises.resolve()
    }
  }
};

// fail - straight up failure.
function fail(err) {
  assert.fail(String(err));
}

describe('calculator', function () {
  var calculator;
  var dbMock;

  beforeEach(function () {
    dbMock = Object.create(DbMock);

    calculator = Object.create(Calculator);
    calculator.init({
      db: dbMock
    });

  });

  afterEach(function () {
    dbMock = calculator = null;
  });

  it('can calculate!', function (done) {
    calculator.calculate({
      table_name: {
        value_to_return: 'this is input and output'
      }
    })
    .then(function(results) {
      assert.equal(results.table_name, 'this is input and output');
      assert.ok(results.duration > 0);
      done();
    }, fail);
  });
});
