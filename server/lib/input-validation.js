/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A simple wrapper around joi with some helper functions.

const joi = require('joi');
const accessLevels = Object.keys(require('rum-diary-access-levels'));

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

// A location for navigation data.
// TODO - fill this out. It should be a full URL.
exports.location = function () {
  return joi.string().allow('').optional();
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


// A user's real name.
exports.userRealName = function () {
  return joi.string().min(3).max(50);
};

// The user-agent
exports.userAgent = function () {
  return joi.string().min(0).max(200).optional();
};
