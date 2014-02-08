#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a little inefficient script to go through the database and count all
// uncounted pageViews that have not been added to the site's hit count.

const Promise = require('bluebird');
const db = require('../server/lib/db');

 db.pageView.get({})
  .then(function(sites) {
    return sites.filter(function(site) {
      if (!site.is_counted) return site;
    });
  })
  .then(function(uncounted) {
    var resolver = Promise.defer();

    console.log('found :%s uncounted items', uncounted.length);

    function countNext() {
      var next = uncounted.shift();
      if (!next) return resolver.fulfill();

      db.site.getOne({ hostname: next.hostname })
        .then(function(site) {
          if ( ! site) {
            return db.site.create({
              hostname: next.hostname
            });
          }

          return site;
        })
        .then(function(site) {
          return db.site.hit({ hostname: next.hostname });
        })
        .then(function() {
          next.is_counted = true;
          return db.pageView.update(next);
        })
        .then(countNext);
    }
    countNext();

    return resolver.promise;
  })
  .then(function() {
    process.exit(0);
  });
