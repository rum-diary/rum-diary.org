/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('../lib/logger');
const db = require('../lib/db');

exports.path = '/unload';
exports.verb = 'post';
exports.enable_cors = true;

exports.handler = function (req, res) {
  var data = req.body;
  if (!data.uuid) return res.send(400);

  // don't wanna be hanging around for a response.
  res.send(200, { success: true });


  // The referrer here is the page where the stats were collected,
  // not the referrer of the page where the stats were collected.
  // The referrer of the page where the stats were collection is
  // collected by the client and sent in the data set.
  var referrer = req.get('referrer');
  logger.info('received unload data for: %s', referrer);

  // TODO: use getOneAndUpdate
  db.pageView.getOne({
    uuid: data.uuid
  }).then(function(pageView) {
    pageView.duration = data.duration;
    return db.pageView.update(pageView);
  }, function(err) {
    logger.error('Uh oh, pageView update error: %s', String(err));
  });
};
