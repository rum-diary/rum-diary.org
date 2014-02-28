/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count hits per day

const util = require('util');
const moment = require('moment');
const ReduceStream = require('../reduce-stream');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

util.inherits(HitsPerDayStream, ReduceStream);

function HitsPerDayStream(options) {
  if (! options) options = {};
  /*if (! options.start) options.start = earliestDate(hits, 'createdAt');*/
  /*if (! options.end) options.end = latestDate(hits, 'createdAt');*/

  options.start = moment(options.start).startOf('day').toDate().getTime();
  options.end = moment(options.end).endOf('day').toDate().getTime();

  ReduceStream.call(this, options);

  ensurePageInfo(this._data, '__all', options.start, options.end);
}

HitsPerDayStream.prototype.name = 'hits_per_day';
HitsPerDayStream.prototype.type = Object;

HitsPerDayStream.prototype._write = function(chunk, encoding, callback) {
  var options = this.getOptions();
  var date = new Date(chunk.createdAt).getTime();

  if (chunk.path) {
    ensurePageInfo(this._data, chunk.path, options.start, options.end);
    incrementDailyPageHit(this._data, chunk.path, options.start, date);
  }

  incrementDailyPageHit(this._data, '__all', options.start, date);

  callback(null);
};

/*
function earliestDate(data, dateName) {
  return data.reduce(function (prevStart, item) {
            var currStart = new Date(item[dateName]);
            if ( ! prevStart) return currStart;
            if (currStart < prevStart) return currStart;
            return prevStart;
          }, null);
}

function latestDate(data, dateName) {
  return data.reduce(function (prevEnd, item) {
            var currEnd = new Date(item[dateName]);
            if ( ! prevEnd) return currEnd;
            if (currEnd > prevEnd) return currEnd;
            return prevEnd;
          }, null);
}
*/

function ensurePageInfo(returnedData, page, startDate, endDate) {
  if ( ! returnedData.hasOwnProperty(page)) {
    var numDays = diffDays(startDate, endDate);
    returnedData[page] = new Array(numDays);
    // <= to include both the start and end date
    for (var i = 0; i <= numDays; ++i) {
      var date = new Date();
      date.setTime(startDate + (i * MS_PER_DAY));
      returnedData[page][i] = {
        hits: 0,
        date: moment(date).format('YYYY-MM-DD')
      };
    }
  }

  return returnedData;
}

function diffDays(startDate, date) {
  // Math.floor is really slow, so do
  // Math.floor using bit operations.
  return ((date - startDate) / MS_PER_DAY) << 0;
}

function getPageInfoOnDate(pageInfo, page, startDate, date) {
  var index = diffDays(startDate, date);
  return pageInfo[page][index];
}

function incrementDailyPageHit(returnedData, page, startDate, date) {
  var pageInfoOnDate = getPageInfoOnDate(returnedData, page, startDate, date);
  if ( ! pageInfoOnDate) return new Error('invalid date range');
  pageInfoOnDate.hits++;
}


module.exports = HitsPerDayStream;
