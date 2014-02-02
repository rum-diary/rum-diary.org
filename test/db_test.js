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
    beforeEach(function(done) {
      db.save({
        uuid: 'another-uuid'
      }, done);
    });

    it('should get saved data', function(done) {
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

  describe('getByHostname', function() {
    beforeEach(function(done) {
      db.save({
        hostname: 'shanetomlinson.com',
        uuid: 'shanetomlinson-uuid',
        referrer: 'https://bigsearchcompany.com/search',
        referrer_hostname: 'bigsearchcompany.com',
        referrer_path: '/search',
        returning: true
      }, done);
    });

    it('should return data for the specified hostname', function(done) {
      db.getByHostname('shanetomlinson.com', function(err, data) {
        assert.isNull(err);
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'shanetomlinson-uuid');
        assert.equal(data[0].referrer, 'https://bigsearchcompany.com/search');
        assert.equal(data[0].referrer_hostname, 'bigsearchcompany.com');
        assert.equal(data[0].referrer_path, '/search');
        assert.equal(data[0].returning, true);
        done();
      });
    });
  });

  describe('get with tags', function() {
    beforeEach(function(done) {
      db.save({
        hostname: 'shanetomlinson.com',
        uuid: 'shanetomlinson-uuid',
        referrer: 'bigsearchcompany.com',
        tags: ['experiment1', 'tag'],
      }, function() {
        db.save({
          hostname: 'shanetomlinson.com',
          uuid: 'shanetomlinson-uuid',
          referrer: 'bigsearchcompany.com',
          tags: ['experiment22', 'tag'],
        }, done);
      });
    });

    it('returns item if tag is stored', function(done) {
      db.get({ hostname: 'shanetomlinson.com', tags: ['experiment1'] }, function(err, data) {
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'shanetomlinson-uuid');
        assert.equal(data[0].referrer, 'bigsearchcompany.com');
        assert.equal(data[0].tags[0], 'experiment1');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns item if other tag is stored', function(done) {
      db.get({ tags: ['tag'] }, function(err, data) {
        assert.equal(data.length, 2);
        assert.equal(data[0].uuid, 'shanetomlinson-uuid');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns item if both tags are specified', function(done) {
      db.get({ tags: ['tag', 'experiment1'] }, function(err, data) {
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'shanetomlinson-uuid');
        assert.equal(data[0].referrer, 'bigsearchcompany.com');
        assert.equal(data[0].tags[0], 'experiment1');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns no items if any tag is invalid', function(done) {
      db.get({ tags: ['tag', 'not_valid'] }, function(err, data) {
        assert.equal(data.length, 0);
        done();
      });
    });

    it('returns no items if tag is not found', function(done) {
      db.get({ tags: 'not_valid' }, function(err, data) {
        assert.equal(data.length, 0);
        done();
      });
    });
  });

});

