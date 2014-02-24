/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, beforeEach, afterEach, it*/

const mocha = require('mocha');
const assert = require('chai').assert;

const db = require('../server/lib/db');

// cPass - curried pass - call done when done.
function cPass(done) {
  return function () {
    done();
  };
}

// fail - straight up failure.
function fail(err) {
  assert.fail(String(err));
}


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
        }).then(cPass(done), fail);
    });
  });

  describe('get', function () {
    beforeEach(function (done) {
      db.pageView.create({
          uuid: 'another-uuid'
        }).then(cPass(done), fail);
    });

    it('should get saved data', function (done) {
      db.pageView.get()
        .then(function (data) {
          assert.equal(data.length, 1);
          var item = data[0];
          assert.equal(item.uuid, 'another-uuid');
          assert.isDefined(item.createdAt);
          assert.isDefined(item.updatedAt);
          done();
        }, fail);
    });
  });

  describe('get with fields specified', function () {
    beforeEach(function (done) {
      db.pageView.create({
        uuid: 'third-uuid',
        hostname: 'hostname.com',
        os: 'Mac OSX 10.8'
      }).then(cPass(done), fail);
    });

    it('should get only specified fields', function (done) {
      db.pageView.get('uuid hostname')
        .then(function (data) {
          assert.equal(data.length, 1);
          var item = data[0];
          assert.equal(item.uuid, 'third-uuid');
          assert.equal(item.hostname, 'hostname.com');
          assert.isUndefined(item.os);
          done();
        }, fail);
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
      }).then(cPass(done), fail);
    });

    it('should return data for the specified hostname', function (done) {
      db.pageView.getByHostname('shanetomlinson.com')
        .then(function (data) {
          assert.equal(data.length, 1);
          assert.equal(data[0].uuid, 'first-uuid');
          assert.equal(data[0].referrer, 'https://bigsearchcompany.com/search');
          assert.equal(data[0].referrer_hostname, 'bigsearchcompany.com');
          assert.equal(data[0].referrer_path, '/search');
          assert.equal(data[0].returning, true);
          done();
        }, fail);
    });
  });

  describe('get with tags', function () {
    beforeEach(function (done) {
      db.pageView.create({
        hostname: 'shanetomlinson.com',
        uuid: 'first-uuid',
        referrer: 'bigsearchcompany.com',
        tags: ['experiment1', 'tag']
      }).then(function () {
        return db.pageView.create({
          hostname: 'shanetomlinson.com',
          uuid: 'second-uuid',
          referrer: 'bigsearchcompany.com',
          tags: ['experiment22', 'tag']
        })
      }).then(cPass(done), fail);
    });

    it('returns item if tag is stored', function (done) {
      db.pageView.get({ hostname: 'shanetomlinson.com', tags: 'experiment1' })
        .then(function (data) {
          assert.equal(data.length, 1);
          assert.equal(data[0].uuid, 'first-uuid');
          assert.equal(data[0].referrer, 'bigsearchcompany.com');
          assert.equal(data[0].tags[0], 'experiment1');
          assert.equal(data[0].tags[1], 'tag');
          done();
        }, fail);
    });

    it('returns nom matching items if $ne is specified', function (done) {
      db.pageView.get({ hostname: 'shanetomlinson.com', tags: { $ne: 'experiment1' } })
        .then(function (data) {
          assert.equal(data.length, 1);
          assert.equal(data[0].uuid, 'second-uuid');
          assert.equal(data[0].referrer, 'bigsearchcompany.com');
          assert.equal(data[0].tags[0], 'experiment22');
          assert.equal(data[0].tags[1], 'tag');
          done();
        }, fail);
    });

    it('returns item if other tag is stored', function (done) {
      db.pageView.get({ tags: ['tag'] })
        .then(function (data) {
          assert.equal(data.length, 2);
          assert.equal(data[0].uuid, 'first-uuid');
          assert.equal(data[0].tags[1], 'tag');
          done();
        }, fail);
    });

    it('returns item if both tags are specified', function (done) {
      db.pageView.get({ tags: ['tag', 'experiment1'] })
        .then(function (data) {
          assert.equal(data.length, 1);
          assert.equal(data[0].uuid, 'first-uuid');
          assert.equal(data[0].referrer, 'bigsearchcompany.com');
          assert.equal(data[0].tags[0], 'experiment1');
          assert.equal(data[0].tags[1], 'tag');
          done();
        }, fail);
    });

    it('returns no items if any tag is invalid', function (done) {
      db.pageView.get({ tags: ['tag', 'not_valid'] })
        .then(function (data) {
          assert.equal(data.length, 0);
          done();
        }, fail);
    });

    it('returns no items if tag is not found', function (done) {
      db.pageView.get({ tags: 'not_valid' })
        .then(function (data) {
          assert.equal(data.length, 0);
          done();
        }, fail);
    });
  });

  describe('getOne', function () {
    beforeEach(function (done) {
      db.pageView.create({
        hostname: 'shanetomlinson.com',
        uuid: 'first-uuid',
        referrer: 'bigsearchcompany.com',
        tags: ['experiment1', 'tag']
      })
      .then(function () {
        return db.pageView.create({
          hostname: 'shanetomlinson.com',
          uuid: 'second-uuid',
          referrer: 'bigsearchcompany.com',
          tags: ['experiment22', 'tag']
        });
      })
      .then(cPass(done), fail);
    });

    it('returns one item', function (done) {
      db.pageView.getOne({ hostname: 'shanetomlinson.com', tags: ['experiment1'] })
        .then(function (item) {
          assert.equal(item.uuid, 'first-uuid');
          assert.equal(item.referrer, 'bigsearchcompany.com');
          assert.equal(item.tags[0], 'experiment1');
          assert.equal(item.tags[1], 'tag');
          done();
        }, fail);
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
        }, fail);
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
        }, fail);
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
        }, fail);
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
        }, fail);
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
        }).then(cPass(done), fail);
      });

      it('should get one matched hostname', function (done) {
        db.site.getOne({
          hostname: 'testsite.com'
        }).then(function (site) {
          assert.equal(site.hostname, 'testsite.com');
          assert.equal(site.total_hits, 0);
          done();
        }, fail);
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
        }).then(cPass(done), fail);
      });

      it('should return one or more matches', function (done) {
        db.site.get({}).then(function (sites) {
          assert.equal(sites.length, 2);
          assert.equal(sites[0].hostname, 'testsite.com');
          assert.equal(sites[0].total_hits, 0);
          assert.equal(sites[1].hostname, 'rum-diary.org');
          assert.equal(sites[1].total_hits, 0);
          done();
        }, fail);
      });
    });

    describe('ensureExists', function () {
      it('ensures the site exists', function (done) {
        db.site.ensureExists('testsite.com')
          .then(function (siteReturned) {
            assert.equal(siteReturned.hostname, 'testsite.com');
            assert.equal(siteReturned.total_hits, 0);
          }).then(function () {
            return db.site.getOne({ hostname: 'testsite.com' });
          })
          .then(function (siteFetched) {
            assert.equal(siteFetched.hostname, 'testsite.com');
            assert.equal(siteFetched.total_hits, 0);
            done();
          }, fail);
      });
    });

    describe('hit', function () {
      it('should increment the hit_count of the model by one', function (done) {
        db.site.hit('testsite.com')
          .then(function () {
            return db.site.hit('testsite.com');
          })
          .then(function () {
            return db.site.get({});
          }).then(function (sites) {
            assert.equal(sites[0].hostname, 'testsite.com');
            assert.equal(sites[0].total_hits, 2);
            done();
          }, fail);
      });
    });
  });

  describe('tags', function () {
    describe('create', function () {
      it('should create an item', function (done) {
        db.tags.create({
          name: 'tag',
          hostname: 'testsite.com'
        }).then(function (tags) {
          assert.equal(tags.hostname, 'testsite.com');
          assert.equal(tags.total_hits, 0);

          done();
        }, fail);
      });
    });

    describe('getOne', function () {
      beforeEach(function (done) {
        db.tags.create({
          name: 'tag',
          hostname: 'testsite.com'
        }).then(function () {
          return db.tags.create({
            name: 'tag2',
            hostname: 'testsite.org'
          });
        }).then(function () {
          return db.tags.create({
            name: 'tag',
            hostname: 'anothersite.org'
          });
        }).then(cPass(done), fail);
      });

      it('should get one matched hostname', function (done) {
        db.tags.getOne({
          name: 'tag',
          hostname: 'testsite.com'
        }).then(function (tag) {
          assert.equal(tag.name, 'tag');
          assert.equal(tag.hostname, 'testsite.com');
          assert.equal(tag.total_hits, 0);
          done();
        }, fail);
      });
    });

    describe('get', function () {
      beforeEach(function (done) {
        db.tags.create({
          tag: 'tag',
          hostname: 'testsite.com'
        }).then(function () {
          return db.tags.create({
            tag: 'tag2',
            hostname: 'testsite.com'
          });
        }).then(function () {
          return db.tags.create({
            name: 'tag',
            hostname: 'anothersite.org'
          });
        }).then(cPass(done), fail);
      });

      it('should return one or more matches', function (done) {
        db.tags.get({ hostname: 'testsite.com' }).then(function (tags) {
          assert.equal(tags.length, 2);
          /*
          assert.equal(tags[0].name, 'tag');
          assert.equal(tags[0].hostname, 'testsite.com');
          assert.equal(tags[0].total_hits, 0);
          assert.equal(tags[0].name, 'tag2');
          assert.equal(tags[1].hostname, 'testsite.com');
          assert.equal(tags[1].total_hits, 0);
          */
          done();
        }, fail);
      });
    });

    describe('ensureExists', function () {
      it('ensures the tags exists', function (done) {
        db.tags.ensureExists({
            name: 'tag',
            hostname: 'testsite.com'
          })
          .then(function (tagsReturned) {
            assert.equal(tagsReturned.name, 'tag');
            assert.equal(tagsReturned.hostname, 'testsite.com');
            assert.equal(tagsReturned.total_hits, 0);
          }).then(function () {
            return db.tags.getOne({ hostname: 'testsite.com' });
          })
          .then(function (tagsFetched) {
            assert.equal(tagsFetched.name, 'tag');
            assert.equal(tagsFetched.hostname, 'testsite.com');
            assert.equal(tagsFetched.total_hits, 0);
            done();
          }, fail);
      });
    });

    describe('hit', function () {
      it('should increment the hit_count of the model by one', function (done) {
        db.tags.hit('testsite.com')
          .then(function () {
            return db.tags.hit({
              name: 'tag',
              hostname: 'testsite.com'
            });
          })
          .then(function () {
            return db.tags.get({ name: 'tag', hostname: 'testsite.com' });
          }).then(function (tags) {
            assert.equal(tags[0].name, 'tag');
            assert.equal(tags[0].hostname, 'testsite.com');
            assert.equal(tags[0].total_hits, 1);
            done();
          }, fail);
      });
    });
  });



});

