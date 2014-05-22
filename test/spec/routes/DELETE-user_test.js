/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Promise = require('bluebird');

const userCollection = require('../../../server/lib/db').user;

const route = require('../../../server/routes/DELETE-user');

describe('routes/DELETE-user', function () {
  it('throws an error if trying to delete another user', function () {
    var reqMock = {
      session: {
        email: 'bad_person@testuser.com',
        destroy: function () {}
      },
      params: {
        email: 'user_to_delete@testuser.com'
      }
    };

    var resMock = {
      redirect: function (_url) {
      }
    };

    return Promise.all([
          userCollection.create({ email: 'bad_person@testuser.com' }),
          userCollection.create({ email: 'user_to_delete@testuser.com' })
        ])
        .then(function () {
          return route.handler(reqMock, resMock);
        })
        .then(null, function (err) {
          // if error is not thrown, this will not be called.
          return err;
        })
        .then(function (err) {
          assert.ok(err.message.indexOf('Forbidden') > -1);

          // user is not deleted
          return userCollection.getOne({ email: 'user_to_delete@testuser.com' });
        })
        .then(function (user) {
          assert.ok(user);
        });
  });

  it('deletes the user if trying to self-delete', function () {
    var reqMock = {
      session: {
        email: 'testuser@testuser.com',
        destroy: function () {}
      },
      params: {
        email: 'testuser@testuser.com'
      }
    };

    var resMock = {
      redirect: function (_url) {
      }
    };

    return userCollection.create({ email: 'testuser@testuser.com' })
        .then(function () {
          return route.handler(reqMock, resMock);
        })
        .then(function () {
          return userCollection.getOne({ email: 'testuser@testuser.com' });
        })
        .then(function (user) {
          assert.isNull(user);
        });
  });
});

