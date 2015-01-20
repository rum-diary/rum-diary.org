/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Test the routes by making http requests.
 */

const mocha = require('mocha');
const assert = require('chai').assert;
const request = require('request');

const config = require('../../server/lib/config');
const baseURL = 'http://localhost:' + config.get('http_port');


const startStop = require('../lib/start-stop');

var ROUTES = {
  'GET /'                             : 200,
  'GET /index.html'                   : 301,
  'GET /user'                         : 200,
  'GET /welcome'                      : 307,
  'GET /site'                         : 307,
  'GET /site/localhost'               : 307,
  'GET /site/localhost?start=2013-12-25'
                                      : 307,
  'GET /site/localhost?start=2013-12-25&end=2014-01-05'
                                      : 307,
  'GET /site/localhost/performance'   : 307,
  'GET /site/localhost/demographics'  : 307,
  'GET /site/localhost/path/index'    : 307,
  'GET /site/localhost/path/some-page/with-more/and-123-digits'
                                      : 307,
  'GET /site/localhost/path/trailing-slash/'
                                      : 307,
  'GET /site/localhost/path/123'
                                      : 307,
  'GET /site/shanetomlinson.com/path/2013/testing-javascript-frontend-part-1-anti-patterns-and-fixes/'
                                      : 307,
  'GET /site/www.aframejs.com/path/tutorial.html'
                                      : 307,
  'GET /site/connect-fonts.org/path/families'
                                      : 307

};

describe('routes module', function () {
  describe('start', function () {
    it('starts the server', function (done) {
      startStop.start(done);
    });
  });

  describe('request', function () {
    for (var key in ROUTES) {
      it(key, respondsWith(key, ROUTES[key]));
    }
  });

  describe('POST /metrics', function () {
    it('should have CORS `access-control-allow-origin: *` header', function (done) {
      request.post(baseURL + '/metrics', {
        data: {
          hostname: 'unknown.com',
          uuid: 'fake uuid'
        }
      }, function (err, response) {
        assert.equal(response.statusCode, 200, baseURL);

        // CORS is allowed for POST /metrics
        assert.equal(response.headers['access-control-allow-origin'], '*');

        testCommonResponseHeaders(response);

        done();
      });
    });
  });

  describe('stop', function () {
    it('stops', function (done) {
      startStop.stop(function () {
        done();
      });
    });
  });
});

function respondsWith(key, expectedCode) {
  return function (done) {
    var parts = key.split(' ');
    var verb = parts[0].toUpperCase();
    var url = baseURL + parts[1];
    request({
      // disable redirect following to ensure that 301 and 302s are reported.
      followRedirect: false,
      uri: url,
      method: verb,
    }, function (err, response) {
      assert.equal(response.statusCode, expectedCode);

      // CORS is only allowed for POST /metrics
      assert.isUndefined(response.headers['access-control-allow-origin']);

      testCommonResponseHeaders(response);

      done();
    });
  };
}

function testCommonResponseHeaders(response) {
  // Remove the x-powered-by
  assert.isUndefined(response.headers['x-powered-by']);
}


