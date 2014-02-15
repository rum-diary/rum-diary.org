/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;

const db = require('../server/lib/db');


describe('database', function () {
  beforeEach(function (done) {
    db.clear(done);
  });

  afterEach(function (done) {
    db.clear(done);
  });

  describe('save', function () {
    it('should save without an error', function (done) {
      db.pageView.create({
        uuid: 'the-first-uuid'
      }, function (err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('get', function () {
    beforeEach(function (done) {
      db.pageView.create({
        uuid: 'another-uuid'
      }, done);
    });

    it('should get saved data', function (done) {
      db.pageView.get(function (err, data) {
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

  describe('getByHostname', function () {
    beforeEach(function (done) {
      db.pageView.create({
        hostname: 'shanetomlinson.com',
        uuid: 'first-uuid',
        referrer: 'https://bigsearchcompany.com/search',
        referrer_hostname: 'bigsearchcompany.com',
        referrer_path: '/search',
        returning: true
      }, done);
    });

    it('should return data for the specified hostname', function (done) {
      db.pageView.getByHostname('shanetomlinson.com', function (err, data) {
        assert.isNull(err);
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'first-uuid');
        assert.equal(data[0].referrer, 'https://bigsearchcompany.com/search');
        assert.equal(data[0].referrer_hostname, 'bigsearchcompany.com');
        assert.equal(data[0].referrer_path, '/search');
        assert.equal(data[0].returning, true);
        done();
      });
    });
  });

  describe('get with tags', function () {
    beforeEach(function (done) {
      db.pageView.create({
        hostname: 'shanetomlinson.com',
        uuid: 'first-uuid',
        referrer: 'bigsearchcompany.com',
        tags: ['experiment1', 'tag'],
      }, function () {
        db.pageView.create({
          hostname: 'shanetomlinson.com',
          uuid: 'second-uuid',
          referrer: 'bigsearchcompany.com',
          tags: ['experiment22', 'tag'],
        }, done);
      });
    });

    it('returns item if tag is stored', function (done) {
      db.pageView.get({ hostname: 'shanetomlinson.com', tags: 'experiment1' }, function (err, data) {
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'first-uuid');
        assert.equal(data[0].referrer, 'bigsearchcompany.com');
        assert.equal(data[0].tags[0], 'experiment1');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns nom matching items if $ne is specified', function (done) {
      db.pageView.get({ hostname: 'shanetomlinson.com', tags: { $ne: 'experiment1' } }, function (err, data) {
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'second-uuid');
        assert.equal(data[0].referrer, 'bigsearchcompany.com');
        assert.equal(data[0].tags[0], 'experiment22');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns item if other tag is stored', function (done) {
      db.pageView.get({ tags: ['tag'] }, function (err, data) {
        assert.equal(data.length, 2);
        assert.equal(data[0].uuid, 'first-uuid');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns item if both tags are specified', function (done) {
      db.pageView.get({ tags: ['tag', 'experiment1'] }, function (err, data) {
        assert.equal(data.length, 1);
        assert.equal(data[0].uuid, 'first-uuid');
        assert.equal(data[0].referrer, 'bigsearchcompany.com');
        assert.equal(data[0].tags[0], 'experiment1');
        assert.equal(data[0].tags[1], 'tag');
        done();
      });
    });

    it('returns no items if any tag is invalid', function (done) {
      db.pageView.get({ tags: ['tag', 'not_valid'] }, function (err, data) {
        assert.equal(data.length, 0);
        done();
      });
    });

    it('returns no items if tag is not found', function (done) {
      db.pageView.get({ tags: 'not_valid' }, function (err, data) {
        assert.equal(data.length, 0);
        done();
      });
    });
  });

  describe('getOne', function () {
    beforeEach(function (done) {
      db.pageView.create({
        hostname: 'shanetomlinson.com',
        uuid: 'first-uuid',
        referrer: 'bigsearchcompany.com',
        tags: ['experiment1', 'tag'],
      }, function () {
        db.pageView.create({
          hostname: 'shanetomlinson.com',
          uuid: 'second-uuid',
          referrer: 'bigsearchcompany.com',
          tags: ['experiment22', 'tag'],
        }, done);
      });
    });

    it('returns one item', function (done) {
      db.pageView.getOne({ hostname: 'shanetomlinson.com', tags: ['experiment1'] })
        .then(function (item) {
          assert.equal(item.uuid, 'first-uuid');
          assert.equal(item.referrer, 'bigsearchcompany.com');
          assert.equal(item.tags[0], 'experiment1');
          assert.equal(item.tags[1], 'tag');
          done();
        }).then(null, function (err) {
          done();
        });
    });
  });

  describe('user', function () {
    describe('create', function () {
      it('should create an item', function (done) {
        db.user.create({
          name: 'Site Administrator',
          email: 'testuser@testuser.com'
        }).then(function (user) {
          assert.equal(user.name, 'Site Administrator');
          assert.equal(user.email, 'testuser@testuser.com');

          done();
        });
      });
    });

    describe('get', function () {
      it('should get one or more saved users', function (done) {
        db.user.create({
          name: 'Site Administrator',
          email: 'testuser@testuser.com'
        }).then(function () {
          return db.user.create({
            name: 'Another Administrator',
            email: 'testuser2@testuser.com'
          });
        }).then(function () {
          return db.user.get({
            email: 'testuser2@testuser.com'
          });
        }).then(function (users) {
          assert.equal(users[0].name, 'Another Administrator');
          assert.equal(users[0].email, 'testuser2@testuser.com');
          done();
        });
      });
    });

    describe('getOne', function () {
      it('should get a saved user', function (done) {
        db.user.create({
          name: 'Site Administrator',
          email: 'testuser@testuser.com'
        }).then(function () {
          return db.user.create({
            name: 'Another Administrator',
            email: 'testuser2@testuser.com'
          });
        }).then(function () {
          return db.user.getOne({
            email: 'testuser@testuser.com'
          });
        }).then(function (user) {
          assert.equal(user.name, 'Site Administrator');
          assert.equal(user.email, 'testuser@testuser.com');
          done();
        });
      });
    });
  });

  describe('site', function () {
    describe('create', function () {
      it('should create an item', function (done) {
        db.site.create({
          hostname: 'testsite.com'
        }).then(function (site) {
          assert.equal(site.hostname, 'testsite.com');
          assert.equal(site.total_hits, 0);

          done();
        });
      });
    });

    describe('getOne', function () {
      beforeEach(function (done) {
        db.site.create({
          hostname: 'testsite.com'
        }).then(function () {
          return db.site.create({
            hostname: 'rum-diary.org'
          });
        }).then(function () {
          done();
        });
      });

      it('should get one matched hostname', function (done) {
        db.site.getOne({
          hostname: 'testsite.com'
        }).then(function (site) {
          assert.equal(site.hostname, 'testsite.com');
          assert.equal(site.total_hits, 0);
          done();
        });
      });
    });

    describe('get', function () {
      beforeEach(function (done) {
        db.site.create({
          hostname: 'testsite.com'
        }).then(function () {
          return db.site.create({
            hostname: 'rum-diary.org'
          });
        }).then(function () {
          done()
        });
      });

      it('should return one or more matches', function (done) {
        db.site.get({}).then(function (sites) {
          assert.equal(sites.length, 2);
          assert.equal(sites[0].hostname, 'testsite.com');
          assert.equal(sites[0].total_hits, 0);
          assert.equal(sites[1].hostname, 'rum-diary.org');
          assert.equal(sites[1].total_hits, 0);
          done();
        });
      });
    });

    describe('ensureExists', function () {
      it('ensures the site exists', function (done) {
        db.site.ensureExists('testsite.com')
          .then(function (siteReturned) {
            assert.equal(siteReturned.hostname, 'testsite.com');
            assert.equal(siteReturned.total_hits, 0);
          }).then(function () {
            return db.site.getOne({ hostname: 'testsite.com' })
          })
          .then(function (siteFetched) {
            assert.equal(siteFetched.hostname, 'testsite.com');
            assert.equal(siteFetched.total_hits, 0);
          })
          .then(done);
      });
    });

    describe('hit', function () {
      it('should increment the hit_count of the model by one', function (done) {
        db.site.hit('testsite.com')
          .then(function () {
            return db.site.hit('testsite.com')
          })
          .then(function () {
            return db.site.get({});
          }).then(function (sites) {
            assert.equal(sites[0].hostname, 'testsite.com');
            assert.equal(sites[0].total_hits, 2);
            done();
          });
      });
    });
  });


});

