/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Invitate a user to join the service or view a site. The token is
// sent out in an email verification. When a user verifies, the entry
// is removed from the table.

const Model = require('./model');
const User = require('./user');
const Site = require('./site');

const guid = require('../../lib/guid');

const inviteTokenDefinition = {
  token: {
    type: String,
    default: guid
  },
  // TODO - is from_email really needed?
  from_email: String,
  to_email: String,
  // TODO - does hostname and access_level need to be here, or is
  // it enough to add the user to the site when the invite
  // is created?
  hostname: String,
  access_level: Number
};

const InviteTokenModel = Object.create(Model);
InviteTokenModel.init('InviteToken', inviteTokenDefinition);

/**
 * TODO - is it possible to do this without a name?
 */
/**
 * The general idea is tokens are only sent if a person
 * is not already a user. verify can also be called if
 * one person has multiple invitations.
 */
InviteTokenModel.verify = function (token, name) {
  var invitation;
  var user;

  return this.findOneAndDelete({ token: token })
    .then(function (_invitation) {
      if (! _invitation) {
        throw new Error('invalid invitation');
      }

      invitation = _invitation;

      return ensureUserExists(invitation.to_email, name);
    }).then(function (_user) {
      user = _user;

      // TODO - this is wrong, we should get the user's access level on
      // the site, and if the new level is > than the old level, then
      // update it.
      return Site.setUserAccessLevel(
          invitation.to_email,
          invitation.hostname,
          invitation.access_level
      );
    }).then(function () {
      return user;
    });

  function ensureUserExists(email, name) {
    return User.getOne({ email: email })
      .then(function (user) {
        if (! user) {
          return User.create({
            email: email,
            name: name
          });
        }

        return user;
      });
  }
};

module.exports = InviteTokenModel;
