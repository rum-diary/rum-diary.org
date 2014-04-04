/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe, it*/

/**
 * Test the generic route infrastructure to ensure both values and promises
 * are handled correctly.
 */

const assert = require('chai').assert;
const Promise = require('bluebird');

const routes = require('../server/lib/routes');
const httpErrors = require('../server/lib/http-errors');

var RequestMock = {
  query: {},
  params: {
    hostname: 'testuser.com'
  },
  session: {
    email: 'testuser@testuser.com'
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
  },

  handle: function (req, res) {
    var namespace = getNamespace(req.verb);
    routerMock[namespace][req.url](req, res);
  }
};

function getNamespace(verb) {
  return {
    get: '_gets',
    post: '_posts'
  }[verb];
}

describe('a route handler', function () {
  describe('that returns a value', function () {
    routes.addRoute({
      path: '/return_value',
      verb: 'get',
      template: 'template',
      authorization: function (req) {
        return true;
      },
      handler: function() {
        return { success: true };
      }
    }, routerMock);

    it('renders the value', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/return_value';

      routerMock.handle(request, {
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
      authorization: function (req) {
        return true;
      },
      handler: function() {
        return httpErrors.BadRequestError();
      }
    }, routerMock);

    it('sends the error', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/return_http_error';

      routerMock.handle(request, {
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
      authorization: function (req) {
        return true;
      },
      handler: function() {
      }
    }, routerMock);

    it('does nothing', function () {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/return_nothing';

      routerMock.handle(request, {
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
      authorization: function (req) {
        return true;
      },
      handler: function() {
        return new Promise(function(fulfill, reject) {
          fulfill({ success: true });
        });
      }
    }, routerMock);

    it('renders the value', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/return_promise_fulfill';

      routerMock.handle(request, {
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
      authorization: function (req) {
        return true;
      },
      handler: function() {
        return new Promise(function(fulfill, reject) {
          reject(httpErrors.BadRequestError());
        });
      }
    }, routerMock);

    it('sends the error', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/return_promise_reject';

      routerMock.handle(request, {
        send: function(statusCode, message) {
          assert.equal(statusCode, 400);
          assert.equal(message, 'Bad Request');
          done();
        }
      });
    });
  });

  describe('that requires an unauthenticated user to authenticate', function () {
    routes.addRoute({
      path: '/user_not_authenticated',
      verb: 'get',
      template: 'template',
      authorization: function (req) {
        throw httpErrors.UnauthorizedError();
      },
      handler: function() {
        return {};
      }
    }, routerMock);

    it('redirects to the `/user` page with a `redirectTo` query parameter', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/user_not_authenticated';

      routerMock.handle(request, {
        redirect: function (statusCode, url) {
          assert.equal(statusCode, 307);
          assert.equal(url, '/user');
          done();
        }
      });
    });
  });

  describe('that allows an authorized authenticated user', function () {
    routes.addRoute({
      path: '/user_authenticated',
      verb: 'get',
      template: 'template',
      authorization: function (req) {
        return true;
      },
      handler: function() {
        return {};
      }
    }, routerMock);

    it('serves the page', function (done) {
      var request = Object.create(RequestMock);
      request.verb = 'get';
      request.url = '/user_authenticated';

      routerMock.handle(request, {
        render: function () {
          done();
        }
      });
    });
  });
});
