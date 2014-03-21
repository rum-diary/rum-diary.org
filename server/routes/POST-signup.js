/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');
const verifier = require('../lib/verifier');
const logger = require('../lib/logger');

exports.path = '/signup';
exports.verb = 'post';

exports.handler = function (req, res) {
  const name = req.body.name;
  const assertion = req.body.assertion;

  var verifiedEmail;

  return verifier.verify(assertion)
                 .then(function (email) {
                   verifiedEmail = email;

                   return db.user.getOne({
                     email: email
                   });
                 })
                 .then(function (existingModel) {
                   if (existingModel) {
                     res.json({ success: false, reason: 'email already exists' })
                   }

                   return db.user.create({
                     name: name,
                     email: verifiedEmail
                   });
                 })
                 .then(function (model) {
                   res.json({ success: true, email: verifiedEmail });
                 });

};
