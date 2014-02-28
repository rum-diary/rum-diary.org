/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Page view model. Commonly referred to as a 'hit'

const moment = require('moment');
const _ = require('underscore');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const Model = require('./model');

const pageViewDefinition = {
  uuid: String,
  hostname: String,
  path: String,
  referrer: String,
  referrer_hostname: String,
  referrer_path: String,
  os: String,
  os_parsed: {
    family: String,
    major: Number,
    minor: Number
  },
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
  returning: Boolean,
  is_counted: Boolean,
  is_exit: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 0
  }
};

const PageViewModel = Object.create(Model);
// use PageLoad as the name of the collection instead of PageView
// so that we do not lose the production data. :/
PageViewModel.init('PageLoad', pageViewDefinition);
PageViewModel.getSearchBy = function (searchBy) {
  // default to a 30 day search unless overridden.
  if ( ! searchBy.createdAt) {
    searchBy.createdAt = {
      $gte: moment().subtract('days', 30).toDate()
    };
  }

  // mongo does not have a createdAt, instead the id contains a timestamp.
  // convert createdAt to the timestamp.
  if ( ! searchBy._id && searchBy.createdAt) {
    searchBy._id = {};

    for (var key in searchBy.createdAt) {
      searchBy._id[key] = objectIdWithTimestamp(searchBy.createdAt[key]);
    }

    delete searchBy.createdAt;
  }

  if (searchBy.tags && _.isArray(searchBy.tags)) {
    // If the $all is not specified, then tag order is important. If tags are
    // not specified in the same order as stored in db, match is not made.
    searchBy.tags = {
      $all: searchBy.tags
    };
  }

  return searchBy;
};


// This function returns an ObjectId embedded with a given datetime
// Accepts both Date object and string input

function objectIdWithTimestamp(timestamp) {
    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp.getTime()/1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = new ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}



module.exports = PageViewModel;
