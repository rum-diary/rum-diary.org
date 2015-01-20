/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;

const RequestMock = require('../../mocks/request');
const ResponseMock = require('../../mocks/response');

const NullCollector = require('rum-diary-endpoint').collectors.Null;

const Route = require('../../../server/routes/POST-metrics');

describe('routes/POST-metrics', function () {
  var reqMock, resMock, route, nullCollector;

  beforeEach(function () {
    nullCollector = new NullCollector();

    route = new Route({
      collectors: [ nullCollector ]
    });

    reqMock = new RequestMock({
      data: {
        hostname: 'unknown.com',
        uuid: 'fake uuid'
      }
    });

    resMock = new ResponseMock();
  });

  it('returns 200, always, sets CORS headers', function () {
    route.handler(reqMock, resMock);
    assert.equal(resMock.status, 200);
  });

  it('passes metrics on to the collectors', function (done) {
    nullCollector.on('data', function (data) {
      assert.equal(data.hostname, 'unknown.com');
      assert.equal(data.uuid, 'fake uuid');

      done();
    });

    route.handler(reqMock, resMock);
  });
});

