/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');

// Create a database query object from the information in the request.
module.exports = function(req, res, next) {

  if (req.query.start) {
    req.start = moment(req.query.start).startOf('day');
  } else {
    req.start = moment().subtract(30, 'days').startOf('day');
  }

  if (req.query.end) {
    req.end = moment(req.query.end).endOf('day');
  } else {
    req.end = moment().endOf('day');
  }

  next();
};

