/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// generate invitation emails.

const templates = require('./templates').setup();
const config = require('./config');

function getVerificationURL(token) {
  return config.get('public_url') + '/invitation/' + encodeURIComponent(token);
}

exports.generateHtml = function (invitation) {
  invitation.verification_url = getVerificationURL(invitation.token);
  return templates.render('EMAIL-invitation-html.html', invitation);
};

exports.generateText = function (invitation) {
  invitation.verification_url = getVerificationURL(invitation.token);
  return templates.render('EMAIL-invitation-text.html', invitation);
};

