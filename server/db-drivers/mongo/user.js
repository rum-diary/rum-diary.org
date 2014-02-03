/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// User model

const Model = require('./model');
const Schema = require('mongoose').Schema;

const userDefinition = {
  name: String,
  email: String
};

const UserModel = Object.create(Model);
UserModel.init('User', userDefinition);

module.exports = UserModel;
