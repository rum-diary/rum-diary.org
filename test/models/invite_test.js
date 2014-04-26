/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, beforeEach, afterEach, it*/

const assert = require('chai').assert;

const db = require('../../server/lib/db');
const accessLevels  = require('../../server/lib/access-levels');

const invite = db.invite;

describe('invite', function () {
  beforeEach(function (done) {
    db.clear(done);
  });

  afterEach(function (done) {
    db.clear(done);
  });

  describe('create', function () {
    it('should create an invitation', function () {
      return invite.create({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        hostname: 'testsite.com',
        access_level: accessLevels.ADMIN
      }).then(function (invitation) {
        // a token is created on creation.
        assert.ok(invitation.token);

        // the rest of the properties are passed in.
        assert.equal(invitation.from_email, 'from@testuser.com');
        assert.equal(invitation.to_email, 'to@testuser.com');
        assert.equal(invitation.hostname, 'testsite.com');
        assert.strictEqual(invitation.access_level, accessLevels.ADMIN);
      });
    });
  });

  describe('verify', function () {
    it('should throw an error on an invalid token', function () {
      return invite.verify('invalid token', 'test user')
        .then(function() {
          assert.isTrue(false, 'unexpected success');
        }, function (err) {
          assert.equal(err.message, 'invalid invitation');
        });
    });

    it('should throw an error if the site does not exist', function () {
      return invite.create({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        hostname: 'testsite.com',
        access_level: accessLevels.ADMIN
      }).then(function (invitation) {
        token = invitation.token;
        return invite.verify(invitation.token, 'test user');
      }).then(function () {
        assert.isTrue(false, 'unexpected success');
      }, function (err) {
        assert.equal(err.message, 'cannot find site: testsite.com');
      });
    });

    it('should create a user if they do not exist', function () {
      var token;
      return db.site.create({
        hostname: 'testsite.com'
      }).then(function () {
        return invite.create({
          from_email: 'from@testuser.com',
          to_email: 'to@testuser.com',
          hostname: 'testsite.com',
          access_level: accessLevels.ADMIN
        });
      }).then(function (invitation) {
        token = invitation.token;

        // check to ensure user is returned.
        return invite.verify(invitation.token, 'test user');
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');
      }).then(function () {
        // check to ensure user is created

        return db.user.getOne({ email: 'to@testuser.com' });
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');
      }).then(function () {
        // check to ensure site was updated.

        return db.site.isAuthorizedToAdministrate(
            'to@testuser.com', 'testsite.com');
      }).then(function (canAdministrate) {
        assert.isTrue(canAdministrate);
      }).then(function () {

        // check to ensure invitation is deleted.
        return invite.getOne({ token: token });
      }).then(function(invitation) {
        assert.equal(invitation, null);
      });
    });

    it('should use existing user if they already exist', function () {
      var token;
      return db.site.create({
        hostname: 'testsite.com'
      }).then(function () {
        return db.user.create({
          email: 'to@testuser.com',
          name: 'The user'
        });
      }).then(function () {
        return invite.create({
          from_email: 'from@testuser.com',
          to_email: 'to@testuser.com',
          hostname: 'testsite.com',
          access_level: accessLevels.READONLY
        });
      }).then(function (invitation) {
        token = invitation.token;

        // check to ensure user is returned.
        return invite.verify(invitation.token, 'A different name');
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');
      }).then(function () {
        // check to ensure user is created

        return db.user.getOne({ email: 'to@testuser.com' });
      }).then(function (user) {
        assert.equal(user.name, 'The user');
        assert.equal(user.email, 'to@testuser.com');
      }).then(function () {
        // check to ensure site was updated.

        return db.site.isAuthorizedToView(
            'to@testuser.com', 'testsite.com');
      }).then(function (canAdministrate) {
        assert.isTrue(canAdministrate);
      });
    });
  });
});
