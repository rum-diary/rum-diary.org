/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');

// Create a database query object from the information in the request.
module.exports = function(req) {
  var query = {
    hostname: req.params.hostname
  };

  if (req.query.start) {
    query.start = moment(req.query.start).startOf('day');
  } else {
    query.start = moment().subtract('days', 30).startOf('day');
  }

  if (req.query.end) {
    query.end = moment(req.query.end).endOf('day');
  } else {
    query.end = moment().endOf('day');
  }

  if (req.query.tags) {
    var tags = req.query.tags.split(',');
    query.tags = tagsToMongoSelector(tags);
  }

  if (req.query.referrer) {
    query.referrer = req.query.referrer;
  }

  return query;
};

function tagsToMongoSelector(tags) {
  var $in = [];
  var $nin = [];

  tags.forEach(function (tag) {
    if (isNotTag(tag)) return $nin.push(tag.replace(/^!/, ''));
    $in.push(tag);
  });

  var selector = {};
  if ($in.length) {
    selector.$in = $in;
  }

  if ($nin.length) {
    selector.$nin = $nin;
  }

  return selector;
}

function isNotTag(tag) {
  return /^!/.test(tag);
}

