/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (db, calculator) {
  return {
    exists: function (hostname) {
      return db.site.getOne({ hostname: hostname })
        .then(function (site) {
          return !! site;
        });
    },

    create: function (hostname, email) {
      return db.site.registerNewSite(hostname, email);
    },

    remove: function (hostname) {
      return db.site.findOneAndDelete({ hostname: hostname });
    },

    canAdminister: function (hostname, email) {
      return db.site.isAuthorizedToAdministrate(email, hostname);
    },

    canView: function (hostname, email) {
      return db.site.isAuthorizedToView(email, hostname);
    },

    isOwner: function (hostname, email) {
      return db.site.isOwner(email, hostname);
    },

    setUserAccessLevel: function (hostname, email, accessLevel) {
      return db.site.setUserAccessLevel(email, hostname, accessLevel);
    },

    traffic: calculator.siteTraffic,
    demographics: calculator.siteDemographics,
    performance: calculator.sitePerformance,
    referrals: calculator.siteReferrer,
    adminInfo: calculator.siteAdmin,

    pages: {
      traffic: calculator.pageTraffic
    }
  };
};

