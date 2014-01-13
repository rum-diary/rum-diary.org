/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const useragent = require('useragent');
const logger = require('../lib/logger');
const db = require('../lib/db');

exports.path = '/navigation';
exports.verb = 'post';

exports.handler = function(req, res) {
  // don't wanna me hanging around for a response.
  res.send(200, { success: true });

  // The referrer here is the page where the stats were collected,
  // not the referrer of the page where the stats were collected.
  // The referrer of the page where the stats were collection is
  // collected by the client and sent in the data set.
  var referrer = req.get('referrer');
  logger.info('saving data for: %s', referrer);

  var data = req.body;

  try {
    var parsedUrl = url.parse(referrer);
    data.hostname = parsedUrl.hostname;
    data.path = parsedUrl.pathname;
  } catch(e) {}

  try {
    if (data.referrer) {
      var parsedReferrer = url.parse(data.referrer);
      data.referrer_hostname = parsedUrl.hostname;
      data.referrer_path = parsedUrl.pathname;
    }
  } catch(e) {}

  var ua = useragent.parse(req.get('user-agent'));
  data.os = ua.os;
  data.browser = {
    family: ua.family,
    major: ua.major,
    minor: ua.minor
  };

  db.save(data, function() {
    logger.info('data saved');
  });
};
