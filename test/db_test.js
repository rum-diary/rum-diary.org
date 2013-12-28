/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;

const db = require('../server/lib/db');


beforeEach(function(done) {
  db.clear(done);
});

afterEach(function(done) {
  db.clear(done);
});

describe('database', function() {
  describe('save', function() {
    it('should save without an error', function(done) {
      db.save({
        uuid: 'the-first-uuid'
      }, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('get', function() {
    it('should get saved data', function(done) {
      db.save({
        uuid: 'another-uuid'
      }, function(err) {
        db.get(function(err, data) {
          assert.isNull(err);
          assert.equal(data.length, 1);
          var item = data[0];
          assert.equal(item.uuid, 'another-uuid');
          assert.isDefined(item.createdAt);
          assert.isDefined(item.updatedAt);
          done();
        });
      });
    });
  });

  describe('getByHostname', function() {
    it('should return data for the specified hostname', function(done) {
      db.save({
        hostname: 'rum-diary.org',
        uuid: 'rum-diary-uid'
      }, function(err) {
        db.save({
          hostname: 'shanetomlinson.com',
          uuid: 'shanetomlinson-uuid'
        }, function(err) {
          db.getByHostname('shanetomlinson.com', function(err, data) {
            assert.isNull(err);
            assert.equal(data.length, 1);
            assert.equal(data[0].uuid, 'shanetomlinson-uuid');
            done();
          });
        });
      });
    });
  });
});

