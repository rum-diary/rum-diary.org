/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Site model

const Model = require('./model');
const Schema = require('mongoose').Schema;

const siteDefinition = {
  hostname: String,
  total_hits: Number
};

const SiteModel = Object.create(Model);
SiteModel.init('Site', siteDefinition);

module.exports = SiteModel;
