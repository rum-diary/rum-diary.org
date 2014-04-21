/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, beforeEach, afterEach, it*/

const mocha = require('mocha');
const assert = require('chai').assert;

const db = require('../../server/lib/db');
const user = db.user;

const testExtras = require('../lib/test-extras');
const cPass = testExtras.cPass;
const fail = testExtras.fail;

describe('user', function () {
  beforeEach(function (done) {
    db.clear(done);
  });

  afterEach(function (done) {
    db.clear(done);
  });

  describe('create', function () {
    it('should create an item', function (done) {
      user.create({
        name: 'Site Administrator',
        email: 'testuser@testuser.com'
      }).then(function (user) {
        assert.equal(user.name, 'Site Administrator');
        assert.equal(user.email, 'testuser@testuser.com');

        done();
      }, fail);
    });
  });

  describe('get', function () {
    it('should get one or more saved users', function (done) {
      user.create({
        name: 'Site Administrator',
        email: 'testuser@testuser.com'
      }).then(function () {
        return user.create({
          name: 'Another Administrator',
          email: 'testuser2@testuser.com'
        });
      }).then(function () {
        return user.get({
          email: 'testuser2@testuser.com'
        });
      }).then(function (users) {
        assert.equal(users[0].name, 'Another Administrator');
        assert.equal(users[0].email, 'testuser2@testuser.com');
        done();
      }, fail);
    });
  });

  describe('getOne', function () {
    it('should get a saved user', function (done) {
      user.create({
        name: 'Site Administrator',
        email: 'testuser@testuser.com'
      }).then(function () {
        return user.create({
          name: 'Another Administrator',
          email: 'testuser2@testuser.com'
        });
      }).then(function () {
        return user.getOne({
          email: 'testuser@testuser.com'
        });
      }).then(function (user) {
        assert.equal(user.name, 'Site Administrator');
        assert.equal(user.email, 'testuser@testuser.com');
        done();
      }, fail);
    });
  });
});
