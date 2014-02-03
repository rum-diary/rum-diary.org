/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Model = require('./model');
const Schema = require('mongoose').Schema;

const pageViewDefinition = {
  uuid: String,
  hostname: String,
  path: String,
  referrer: String,
  referrer_hostname: String,
  referrer_path: String,
  os: String,
  browser: {
    family: String,
    major: Number,
    minor: Number
  },
  navigationTiming: {
    'navigationStart': Number,
    'unloadEventStart': Number,
    'unloadEventEnd': Number,
    'redirectStart': Number,
    'redirectEnd': Number,
    'fetchStart': Number,
    'domainLookupStart': Number,
    'domainLookupEnd': Number,
    'connectStart': Number,
    'connectEnd': Number,
    'secureConnectionStart': Number,
    'requestStart': Number,
    'responseStart': Number,
    'responseEnd': Number,
    'domLoading': Number,
    'domInteractive': Number,
    'domContentLoadedEventStart': Number,
    'domContentLoadedEventEnd': Number,
    'domComplete': Number,
    'loadEventStart': Number,
    'loadEventEnd': Number
  },
  timers: Schema.Types.Mixed,
  events: [
    {
      type: String,
      timestamp: Number
    }
  ],
  tags: [ String ],
  returning: Boolean
};

const PageViewModel = Object.create(Model);
PageViewModel.create('PageView', pageViewDefinition);
PageViewModel.getSearchBy = function (searchBy) {
  // default to a 30 day search unless overridden.
  if ( ! searchBy.updatedAt) {
    searchBy.updatedAt = {
      $gte: moment().subtract('days', 30).toDate()
    };
  }

  if (searchBy.tags) {
    // If the $all is not specified, then it matches tags in order
    searchBy.tags = {
      $all: searchBy.tags
    };
  }

  return searchBy;
};

module.exports = PageViewModel;
