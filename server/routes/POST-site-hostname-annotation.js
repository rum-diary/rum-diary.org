/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Sign in an existing user.

const moment = require('moment');
const inputValidation = require('../lib/input-validation');

module.exports = function (config) {
  const annotations = config.annotations;
  const logger = config.logger;

  return {
    path: '/site/:hostname/annotation',
    method: 'post',
    authorization: require('../lib/page-authorization').CAN_ADMIN_HOST,

    validation: {
      _csrf: inputValidation.csrf(),
      occurredAt: inputValidation.date('YYYY-MM-DD'),
      title: inputValidation.string(),
      description: inputValidation.string().allow('').optional()
    },

    handler: function (req, res) {
      const annotation = {
        hostname: req.params.hostname,
        title: req.body.title,
        description: req.body.description,
        occurredAt: moment(req.body.occurredAt, 'YYYY-MM-DD').toDate()
      };

      logger.info('annotation: %s', JSON.stringify(annotation));
      return annotations.create(annotation)
        .then(function () {
          res.redirect(req.get('referrer'));
        });
    }
  };
};
