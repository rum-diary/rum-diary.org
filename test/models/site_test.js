/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, beforeEach, afterEach, it*/

const mocha = require('mocha');
const assert = require('chai').assert;

const db = require('../../server/lib/db');
const site = db.site;

const testExtras = require('../lib/test-extras');
const cPass = testExtras.cPass;
const fail = testExtras.fail;

describe('database', function () {
  beforeEach(function (done) {
    db.clear(done);
  });

  afterEach(function (done) {
    db.clear(done);
  });

  describe('site', function () {
    describe('create', function () {
      it('should create an item', function (done) {
        site.create({
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
        site.create({
          hostname: 'testsite.com'
        }).then(function () {
          return site.create({
            hostname: 'rum-diary.org'
          });
        }).then(cPass(done), fail);
      });

      it('should get one matched hostname', function (done) {
        site.getOne({
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
        site.create({
          hostname: 'testsite.com'
        }).then(function () {
          return site.create({
            hostname: 'rum-diary.org'
          });
        }).then(cPass(done), fail);
      });

      it('should return one or more matches', function (done) {
        site.get({}).then(function (sites) {
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
        site.ensureExists('testsite.com')
          .then(function (siteReturned) {
            assert.equal(siteReturned.hostname, 'testsite.com');
            assert.equal(siteReturned.total_hits, 0);
          }).then(function () {
            return site.getOne({ hostname: 'testsite.com' });
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
        site.hit('testsite.com')
          .then(function () {
            return site.hit('testsite.com');
          })
          .then(function () {
            return site.get({});
          }).then(function (sites) {
            assert.equal(sites[0].hostname, 'testsite.com');
            assert.equal(sites[0].total_hits, 2);
            done();
          }, fail);
      });
    });
  });
});
