/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A simple wrapper around joi with some helper functions.

const joi = require('joi');

'use strict';

for (var key in joi) {
  if (typeof joi[key] === 'function') {
    exports[key] = joi[key].bind(joi);
  }
}

// hostname with optional http:// or https:// prefix.
exports.hostname = function () {
  return joi.alternatives(
      // hostname only, no protocol.
      joi.string().regex(/^(?:(?:[a-z\d]|[a-z\d][a-z\d\-]*[a-z\d])\.)*(?:[a-z\d]|[a-z\d][a-z\d\-]*[a-z\d])$/i).max(255),
      // hostname with protocol.
      joi.string().regex(/^(?:https?:\/\/)?(?:(?:[a-z\d]|[a-z\d][a-z\d\-]*[a-z\d])\.)*(?:[a-z\d]|[a-z\d][a-z\d\-]*[a-z\d])$/i).max(255 + 8)
  );
};

// A BrowserID assertion
// TODO - is there a generic form?
exports.assertion = function () {
  return joi.string().min(100).max(5000);
};

// A CSRF token.
// TODO - is there a generic form?
exports.csrf = function () {
  return joi.string().max(1000);
};

// A referrer for navigation data.
// TODO - fill this out. It should be a full URL.
exports.referrer = function () {
  return joi.string().allow('');
};

// navigationTiming data.
exports.navigationTiming = function () {
  // some fields are optional or are not sent depending on the circumstance.
  // unload events are not sent if the previous page is on a different domain.
  // redirect events are not sent if there is no redirect.
  // secureConnectionStart is not sent if using only an HTTP connection.
  return joi.object({
    navigationStart: joi.number().integer(),
    unloadEventStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    unloadEventEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    redirectStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    redirectEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    fetchStart: joi.number().integer(),
    domainLookupStart: joi.number().integer(),
    domainLookupEnd: joi.number().integer(),
    connectStart: joi.number().integer(),
    connectEnd: joi.number().integer(),
    secureConnectionStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    requestStart: joi.number().integer(),
    responseStart: joi.number().integer(),
    responseEnd: joi.number().integer(),
    domLoading: joi.number().integer(),
    domInteractive: joi.number().integer(),
    domContentLoadedEventStart: joi.number().integer(),
    domContentLoadedEventEnd: joi.number().integer(),
    domComplete: joi.number().integer(),
    loadEventStart: joi.number().integer(),
    loadEventEnd: joi.number().integer()
  });
};

// guids used in reporting session information.
exports.guid = function () {
  return joi.string().guid();
};

// Tags when reporting navigation timing.
exports.tags = function () {
  return joi.array().includes(joi.string());
};
