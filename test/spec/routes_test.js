/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global before, describe, it*/

/**
 * Test the generic route infrastructure to ensure both values and promises
 * are handled correctly.
 */

const assert = require('chai').assert;
const path = require('path');
const Router = require('express').Router;
const TEST_ROUTES_DIRECTORY = path.join(__dirname, '..', 'mocks', 'routes');

const routes = require('../../server/lib/routes');

var router;

var RequestMock = {
  query: {},
  params: {
    hostname: 'testuser.com'
  },
  session: {
    email: 'testuser@testuser.com'
  }
};

describe('a route handler', function () {
  before(function () {
    router = new Router();
    routes.loadRoutesFromDirectory(TEST_ROUTES_DIRECTORY, router);
  });

  describe('that returns a value', function () {
    it('renders the value', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/return_value';

      router.handle(request, {
        render: function(template, templateData) {
          assert.equal(template, 'template');
          assert.equal(templateData.success, true);
          done();
        }
      });
    });
  });

  describe('that returns an http error', function () {
    it('sends the error', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/return_http_error';

      router.handle(request, {
        send: function(statusCode, message) {
          assert.equal(statusCode, 400);
          assert.equal(message, 'Bad Request');
          done();
        }
      });
    });
  });

  describe('that returns false', function () {
    it('does nothing', function () {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/return_false';

      return router.handle(request, {
        send: function() {
          console.trace();
          assert(false, 'unexpected send');
        },
        render: function() {
          console.trace();
          assert(false, 'unexpected render');
        }
      });
    });
  });

  describe('that returns a promise that becomes fulfilled', function () {
    it('renders the value', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/return_promise_fulfill';

      router.handle(request, {
        render: function(template, templateData) {
          assert.equal(template, 'template');
          assert.equal(templateData.success, true);
          done();
        }
      });
    });
  });

  describe('that returns a promise that becomes rejected', function () {
    it('sends the error', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/return_promise_reject';

      router.handle(request, {
        send: function(statusCode, message) {
          assert.equal(statusCode, 400);
          assert.equal(message, 'Bad Request');
          done();
        }
      });
    });
  });

  describe('that requires an unauthenticated user to authenticate', function () {
    it('redirects to the `/user` page with a `redirectTo` query parameter', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/user_not_authenticated';

      router.handle(request, {
        redirect: function (statusCode, url) {
          assert.equal(statusCode, 307);
          assert.equal(url, '/user');
          done();
        }
      });
    });
  });

  describe('that allows an authorized authenticated user', function () {
    it('serves the page', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/user_authenticated';

      router.handle(request, {
        render: function () {
          done();
        }
      });
    });
  });

  describe('that needs to be instantiated', function () {
    it('serves the page', function (done) {
      var request = Object.create(RequestMock);
      request.method = 'get';
      request.url = '/requires_initialization';

      router.handle(request, {
        render: function () {
          done();
        }
      });
    });
  });
});
