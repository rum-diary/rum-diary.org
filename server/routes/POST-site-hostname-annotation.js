/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sign in an existing user.

const moment = require('moment');
const inputValidation = require('../lib/input-validation');
const Annotation = require('../lib/db').annotation;
const logger = require('../lib/logger');

exports.path = '/site/:hostname/annotation';
exports.method = 'post';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.validation = {
  _csrf: inputValidation.csrf(),
  occurredAt: inputValidation.date('YYYY-MM-DD'),
  title: inputValidation.string(),
  description: inputValidation.string().allow('').optional()
};


exports.handler = function (req, res) {
  var annotation = {
    hostname: req.params.hostname,
    title: req.body.title,
    description: req.body.description,
    occurredAt: moment(req.body.occurredAt, 'YYYY-MM-DD').toDate()
  };

  logger.info('annotation: %s', JSON.stringify(annotation));
  return Annotation.create(annotation)
    .then(function () {
      res.redirect(req.get('referrer'));
    });
};
