/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');

// Create a database query object from the information in the request.
module.exports = function(req) {
  var query = {
    hostname: req.params.hostname
  };

  var start, end;

  if (req.query.start) {
    start = moment(req.query.start).startOf('day');
  } else {
    start = moment().subtract('days', 30).startOf('day');
  }

  if (req.query.end) {
    end = moment(req.query.end).endOf('day');
  } else {
    end = moment().endOf('day');
  }

  query.updatedAt = {
    '$gte': start.toDate(),
    '$lte': end.toDate()
  };


  if (req.query.tags) {
    var tags = req.query.tags.split(',');
    query.tags = tags;
  }

  if (req.query.referrer) {
    query.referrer = req.query.referrer;
  }

  return query;
};

