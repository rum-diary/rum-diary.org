/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, beforeEach, afterEach, it*/

const assert = require('chai').assert;

const db = require('../../server/lib/db');
const accessLevels  = require('../../server/lib/access-levels');

const invite = db.invite;
const user = db.user;

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

  describe('isTokenValid', function () {
    it('should return true if token is valid', function () {
      return invite.create({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        hostname: 'testsite.com',
        access_level: accessLevels.ADMIN
      }).then(function (invitation) {
        // a token is created on creation.
        return invite.isTokenValid(invitation.token);
      }).then(function (isValid) {
        assert.isTrue(isValid);
      });
    });

    it('should return false if token is valid', function () {
      return invite.isTokenValid('invalid token')
        .then(function(isValid) {
          assert.isFalse(isValid);
        });
    });
  });

  describe('doesInviteeExist', function () {
    it('should return true if invitee exists', function () {
      var invitation;

      return invite.create({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        hostname: 'testsite.com',
        access_level: accessLevels.ADMIN
      }).then(function (_invitation) {
        invitation = _invitation;

        return user.create({
          email: 'to@testuser.com'
        });
      }).then(function () {
        return invite.doesInviteeExist(invitation.token);
      }).then(function (isValid) {
        assert.isTrue(isValid);
      });
    });

    it('should return false if invitee does not exist', function () {
      return invite.create({
        from_email: 'from@testuser.com',
        to_email: 'to@testuser.com',
        hostname: 'testsite.com',
        access_level: accessLevels.ADMIN
      }).then(function (invitation) {
        return invite.doesInviteeExist(invitation.token);
      }).then(function (isValid) {
        assert.isFalse(isValid);
      });
    });
  });

  describe('verifyNewUser', function () {
    it('should throw an error on an invalid token', function () {
      return invite.verifyNewUser('invalid token', 'test user')
        .then(function() {
          assert.isTrue(false, 'unexpected success');
        }, function (err) {
          assert.equal(err.message, 'invalid invitation');
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
        return invite.verifyNewUser(invitation.token, 'test user');
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');
      }).then(function () {
        // check to ensure user is created

        return db.user.getOne({ email: 'to@testuser.com' });
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');

        // check to ensure invitation is deleted.
        return invite.getOne({ token: token });
      }).then(function(invitation) {
        assert.equal(invitation, null);
      });
    });

    it('should throw an error if user already exists', function () {
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
        return invite.verifyNewUser(invitation.token, 'A different name');
      }).then(null, function (err) {
        assert.equal(err.message, 'user already exists');

        // check to ensure invitation is not deleted.
        return invite.getOne({ token: token });
      }).then(function(invitation) {
        assert.ok(invitation);
      });
    });
  });

  describe('verifyExistingUser', function () {
    it('should throw an error if user does not exist', function () {
      var token;
      return db.site.create({
        hostname: 'testsite.com'
      }).then(function () {
        return invite.create({
          from_email: 'from@testuser.com',
          to_email: 'to@testuser.com',
          hostname: 'testsite.com',
          access_level: accessLevels.READONLY
        });
      }).then(function (invitation) {
        token = invitation.token;

        // check to ensure an error is thrown.
        return invite.verifyExistingUser(invitation.token);
      }).then(null, function (err) {
        assert.equal(err.message, 'invalid user');

        // check to ensure invitation is not deleted.
        return invite.getOne({ token: token });
      }).then(function(invitation) {
        assert.ok(invitation);
      });
    });

    it('should delete token of existing user', function () {
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
        return invite.verifyExistingUser(invitation.token);
      }).then(function (user) {
        assert.equal(user.email, 'to@testuser.com');

        // check to ensure invitation is deleted.
        return invite.getOne({ token: token });
      }).then(function(invitation) {
        assert.equal(invitation, null);
      });
    });
  });
});
