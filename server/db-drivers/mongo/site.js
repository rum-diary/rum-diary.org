/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Site model

const Model = require('./model');
const accessLevels = require('../../lib/access-levels');

const siteDefinition = {
  hostname: String,
  total_hits: {
    type: Number,
    default: 0
  },
  admin_users: {
    type: [ String ],
    default: []
  },
  readonly_users: {
    type: [ String ],
    default: []
  },
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
  return this.findOneAndUpdate(
    { hostname: hostname },
    {
      $inc: { total_hits: 1 }
    },
    { upsert: true });
};

/**
 * Set a user's access level on the site.
 */
SiteModel.setUserAccessLevel = function(email, hostname, accessLevel) {
  return SiteModel.getOne({ hostname: hostname })
    .then(function (site) {
      if (! site) {
        throw new Error('cannot find site: ' + hostname);
      }

      // TODO - we should really be doing this as an atomic
      // op when reading the site.

      var isReadonlyUpdated = false;
      var isAdminUpdated = false;

      if (accessLevel === accessLevels.NONE) {
        isReadonlyUpdated = removeReadonlyAccess(site, email);
        isAdminUpdated = removeAdminAccess(site, email);
      } else if (accessLevel === accessLevels.ADMIN) {
        isReadonlyUpdated = removeReadonlyAccess(site, email);
        isAdminUpdated = addAdminAccess(site, email);
      } else if (accessLevel === accessLevels.READONLY) {
        isReadonlyUpdated = addReadonlyAccess(site, email);
        isAdminUpdated = removeAdminAccess(site, email);
      }

      if (isReadonlyUpdated || isAdminUpdated) {
        return SiteModel.update(site);
      }

      return site;
    });

  function addReadonlyAccess(site, email) {
    if (site.readonly_users.indexOf(email) === -1) {
      site.readonly_users.push(email);
      return true;
    }
  }

  function removeReadonlyAccess(site, email) {
    var readonlyIndex = site.readonly_users.indexOf(email);
    if (readonlyIndex > -1) {
      site.readonly_users.splice(readonlyIndex, 1);
      return true;
    }
  }

  function addAdminAccess(site, email) {
    if (site.admin_users.indexOf(email) === -1) {
      site.admin_users.push(email);
      return true;
    }
  }

  function removeAdminAccess(site, email) {
    var adminIndex = site.admin_users.indexOf(email);
    if (adminIndex > -1) {
      site.admin_users.splice(adminIndex, 1);
      return true;
    }
  }
};

/**
 * Check if a user is authorized to view a site.
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

/**
 * Check if a user is authorized to administrate a site.
 */
SiteModel.isAuthorizedToAdministrate = function (email, hostname) {
  return this.getOne({ hostname: hostname })
              .then(function (model) {
                if (! model) return false;

                if (model.admin_users.indexOf(email) > -1) return true;
                return false;
              });
};

module.exports = SiteModel;
