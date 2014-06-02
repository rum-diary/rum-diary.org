/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const httpErrors = require('../lib/http-errors');
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');

exports.path = '/unload';
exports.method = 'post';
exports.enable_cors = true;
exports.authorization = require('../lib/page-authorization').ANY;

exports.validation = {
  uuid: inputValidation.guid(),
  duration: inputValidation.duration(),
  timers: inputValidation.timers(),
  events: inputValidation.events()
};

exports.handler = function (req, res) {
  var data = req.body;

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
    if (! pageView) return;

    pageView.duration = data.duration;
    return db.pageView.update(pageView);
  }, function(err) {
    logger.error('Uh oh, pageView update error: %s', String(err));
  });
};
