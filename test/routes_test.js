/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Test the generic route infrastructure to ensure both values and promises
 * are handled correctly.
 */

const mocha = require('mocha');
const assert = require('chai').assert;
const Promise = require('bluebird');

const routes = require('../server/lib/routes');
const httpErrors = require('../server/lib/http-errors');

var RequestMock = {
  query: {},
  params: {
    hostname: 'testuser.com'
  }
};

var routerMock = {
  _gets: {},
  get: function(path, middleware, handler) {
    if (! handler) {
      handler = middleware;
      middleware = null;
    }

    this._gets[path] = handler;
  },

  _posts: {},
  post: function(path, middleware, handler) {
    if (! handler) {
      handler = middleware;
      middleware = null;
    }

    this._posts[path] = handler;
  }
};

describe('a route handler', function () {
  describe('that returns a value', function () {
    routes.addRoute({
      path: '/return_value',
      verb: 'get',
      template: 'template',
      handler: function() {
        return { success: true };
      }
    }, routerMock);

    it('renders the value', function (done) {
      routerMock._gets['/return_value'](Object.create(RequestMock), {
        render: function(template, templateData) {
          assert.equal(template, 'template');
          assert.equal(templateData.success, true);
          done();
        }
      });
    });
  });

  describe('that returns an http error', function () {
    routes.addRoute({
      path: '/return_http_error',
      verb: 'get',
      template: 'template',
      handler: function() {
        return httpErrors.BadRequestError();
      }
    }, routerMock);

    it('sends the error', function (done) {
      routerMock._gets['/return_http_error'](Object.create(RequestMock), {
        send: function(statusCode, message) {
          assert.equal(statusCode, 400);
          assert.equal(message, 'Bad Request');
          done();
        }
      });
    });
  });

  describe('that returns nothing', function () {
    routes.addRoute({
      path: '/return_nothing',
      verb: 'get',
      template: 'template',
      handler: function() {
      }
    }, routerMock);

    it('does nothing', function () {
      routerMock._gets['/return_nothing'](Object.create(RequestMock), {
        send: function() {
          assert.fail();
        },
        render: function() {
          assert.fail();
        }
      });
    });
  });

  describe('that returns a promise that becomes fulfilled', function () {
    routes.addRoute({
      path: '/return_promise_fulfill',
      verb: 'get',
      template: 'template',
      handler: function() {
        return new Promise(function(fulfill, reject) {
          fulfill({ success: true });
        });
      }
    }, routerMock);

    it('renders the value', function (done) {
      routerMock._gets['/return_promise_fulfill'](Object.create(RequestMock), {
        render: function(template, templateData) {
          assert.equal(template, 'template');
          assert.equal(templateData.success, true);
          done();
        }
      });
    });
  });

  describe('that returns a promise that becomes rejected', function () {
    routes.addRoute({
      path: '/return_promise_reject',
      verb: 'get',
      template: 'template',
      handler: function() {
        return new Promise(function(fulfill, reject) {
          reject(httpErrors.BadRequestError());
        });
      }
    }, routerMock);

    it('sends the error', function (done) {
      routerMock._gets['/return_promise_reject'](Object.create(RequestMock), {
        send: function(statusCode, message) {
          assert.equal(statusCode, 400);
          assert.equal(message, 'Bad Request');
          done();
        }
      });
    });
  });
});
