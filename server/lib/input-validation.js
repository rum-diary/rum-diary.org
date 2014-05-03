/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A simple wrapper around joi with some helper functions.

const joi = require('joi');
const accessLevels = Object.keys(require('./access-levels'));

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
  return joi.string().min(10).max(5000).required();
};

// An email
exports.email = function () {
  return joi.string().email();
};

// A CSRF token. Always required.
exports.csrf = function () {
  return joi.string().max(1000).required();
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
    navigationStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    unloadEventStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    unloadEventEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    redirectStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    redirectEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    fetchStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domainLookupStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domainLookupEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    connectStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    connectEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    secureConnectionStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    requestStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    responseStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    responseEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domLoading: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domInteractive: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domContentLoadedEventStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domContentLoadedEventEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    domComplete: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    loadEventStart: joi.alternatives(joi.number().integer(), joi.any().allow(null)),
    loadEventEnd: joi.alternatives(joi.number().integer(), joi.any().allow(null))
  });
};

// guids used in reporting session information.
exports.guid = function () {
  return joi.string().guid();
};

// previous uuid - this is optional and is not reported if the user
// is visiting their first page on the site in this session.
exports.puuid = function () {
  return joi.alternatives(exports.guid(), joi.any().allow(null));
};

// Tags when reporting navigation timing.
exports.tags = function () {
  return joi.array().includes(joi.string().allow(''));
};

// Session duration.
exports.duration = function () {
  return joi.alternatives(joi.number().integer(), joi.any().allow(null));
};

// unload data timers.
exports.timers = function () {
  return joi.object();
};

// unload data events.
exports.events = function () {
  return joi.array(joi.any());
};

// page access levels.
exports.accessLevel = function () {
  return joi.string().allow(accessLevels);
};
