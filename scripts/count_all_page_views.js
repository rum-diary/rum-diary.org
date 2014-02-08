#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// a little inefficient script to go through the database and count all
// uncounted pageViews that have not been added to the site's hit count.

const moment = require('moment');
const Promise = require('bluebird');
const db = require('../server/lib/db');

const sites = {};

db.pageView.get({
    createdAt: {
      $gte: moment('2010-01-01').toDate()
    }
  })
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

      next.is_counted = true;
      db.pageView.update(next)
        .then(function() {
          var hostname = next.hostname;

          if (hostname) {
            if (!(hostname in sites)) {
              sites[hostname] = 0;
            }

            sites[hostname]++;
          }
        })
        .then(countNext);
    }
    countNext();

    return resolver.promise;
  })
  .then(function() {
    var resolver = Promise.defer();

    console.log('counts: %s', JSON.stringify(sites));
    var hostnames = Object.keys(sites);

    function updateNext() {
      var hostname = hostnames.shift();
      if (!hostname) return resolver.fulfill();

      db.site.ensureExists(hostname)
                .then(function(site) {
                  site.total_hits += sites[hostname];
                  console.log('%s total hits: %s', hostname, site.total_hits);
                  return db.site.update(site);
                })
                .then(updateNext);
    }
    updateNext();

    return resolver.promise;
  })
  .then(function() {
    process.exit(0);
  });
