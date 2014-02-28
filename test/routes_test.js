/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const request = require('request');

const config = require('../server/lib/config');
const baseURL = 'http://localhost:' + config.get('https_port');


const startStop = require('./lib/start-stop');

var ROUTES = {
  'GET /'                             : 200,
  'GET /index.html'                   : 301,
  'GET /site'                         : 200,
  'GET /site/localhost'               : 200,
  'GET /site/localhost?start=2013-12-25'
                                      : 200,
  'GET /site/localhost?start=2013-12-25&end=2014-01-05'
                                      : 200,
  'GET /site/localhost/performance'   : 200,
  'GET /site/localhost/demographics'  : 200,
  'GET /site/localhost/all'           : 200,
  'GET /site/localhost/navigation'    : 200,
  'GET /site/localhost/navigation/medians'
                                      : 200,
  'GET /site/localhost/navigation/distribution'
                                      : 200,
  'GET /site/localhost/hits'          : 200,
  'GET /site/localhost/path/index'    : 200,
  'GET /site/localhost/path/some-page/with-more/and-123-digits'
                                      : 200,
  'GET /site/localhost/path/trailing-slash/'
                                      : 200,
  'GET /site/localhost/path/123'
                                      : 200,
  'GET /site/shanetomlinson.com/path/2013/testing-javascript-frontend-part-1-anti-patterns-and-fixes/'
                                      : 200,
  'GET /site/connect-fonts.org/path/families'
                                      : 200

};

describe('routes module', function() {
  describe('start', function() {
    it('starts the server', function(done) {
      startStop.start(done);
    });
  });

  describe('request', function() {
    for (var key in ROUTES) {
      it(key, respondsWith(key, ROUTES[key]));
    }
  });

  describe('POST /navigation', function() {
    it('should have CORS `access-control-allow-origin: *` header', function(done) {
      request.post(baseURL + '/navigation', function(err, response) {
        assert.equal(response.statusCode, 200);

        // CORS is allowed for POST /navigation
        assert.equal(response.headers['access-control-allow-origin'], '*');

        testCommonResponseHeaders(response);

        done();
      });
    });
  });

  describe('POST /unload', function() {
    it('should respond with 400 if no uuid sent', function(done) {
      request.post(baseURL + '/unload', function(err, response) {
        assert.equal(response.statusCode, 400);

        done();
      });
    });

    it('should respond with 200 and CORS headers if valid', function(done) {
      request.post({
        url: baseURL + '/unload',
        json: { uuid: 'the-uuid-to-update' }
      }, function(err, response) {
        assert.equal(response.statusCode, 200);

        // CORS is allowed for POST /unload
        assert.equal(response.headers['access-control-allow-origin'], '*');

        testCommonResponseHeaders(response);


        done();
      });
    });
  });

  describe('stop', function() {
    it('stops', function(done) {
      startStop.stop(function() {
        done();
      });
    });
  });
});

function respondsWith(key, expectedCode) {
  return function(done) {
    var parts = key.split(' ');
    var verb = parts[0].toUpperCase();
    var url = baseURL + parts[1];
    request({
      // disable redirect following to ensure that 301 and 302s are reported.
      followRedirect: false,
      uri: url,
      method: verb,
    }, function(err, response) {
      assert.equal(response.statusCode, expectedCode);

      // CORS is only allowed for POST /navigation
      assert.isUndefined(response.headers['access-control-allow-origin']);

      testCommonResponseHeaders(response);

      done();
    });
  };
}

function testCommonResponseHeaders(response) {
  // Remove the x-powered-by
  assert.isUndefined(response.headers['x-powered-by']);

  // ensure CSP headers
  assert.equal(response.headers['x-content-security-policy'],
            "default-src 'self';");

  // DENY xframes
  assert.equal(response.headers['x-frame-options'], 'DENY');

  // disable mime type sniffing
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
}


