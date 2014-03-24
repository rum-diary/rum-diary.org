/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Site model

const Model = require('./model');

const siteDefinition = {
  hostname: String,
  total_hits: {
    type: Number,
    default: 0
  },
  admin_users: [ String ],
  readonly_users: [ String ],
  // Is a site public
  is_public: {
    type: Boolean,
    default: true
  }
};

const SiteModel = Object.create(Model);
SiteModel.init('Site', siteDefinition);

SiteModel.ensureExists = function (hostname) {
  var self = this;
  return this.getOne({ hostname: hostname })
              .then(function (model) {
                if (model) return model;

                return self.create({
                  hostname: hostname
                });
              });
};

SiteModel.hit = function (hostname) {
  var self = this;
  return this.ensureExists(hostname)
            .then(function (model) {
              model.total_hits++;
              return self.update(model);
            });
};

/**
 * Check if a user is authorized to view a page.
 */
SiteModel.isAuthorizedToView = function (email, hostname) {
  return this.getOne({ hostname: hostname })
              .then(function (model) {
                if (! model) return false;

                if (model.readonly_users.indexOf(email) > -1) return true;
                if (model.admin_users.indexOf(email) > -1) return true;
                return false;
              });
};

module.exports = SiteModel;
