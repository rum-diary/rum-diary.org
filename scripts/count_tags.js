#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// go through the database and count all tags

const moment = require('moment');
const Promise = require('bluebird');
const db = require('../server/lib/db');
const logger = require('../server/lib/logger');

const sites = {};

db.tags.clear()
  .then(function() {
    return db.pageView.get({
      createdAt: {
        $gte: moment('2010-01-01').toDate()
      }
    });
  })
  .then(function(pageViews) {
    logger.info('counting tags for %s pages', pageViews.length);
    pageViews.forEach(function(next) {
      var hostname = next.hostname;
      var tags = next.tags;

      if (hostname) {
        hostname = hostname.trim();
        if (!hostname) return;

        tags.forEach(function(tag) {
          tag = tag.trim();
          if (! tag) return;

          if (!(hostname in sites)) {
            sites[hostname] = {};
          }

          if (!(tag in sites[hostname])) {
            sites[hostname][tag] = 0;
          }

          sites[hostname][tag]++;
        });
      }
    });
  })
  .then(function() {
    var resolver = Promise.defer();

    console.log('tags: %s', JSON.stringify(sites));
    var hostnames = Object.keys(sites);
    var outstanding = 0;

    hostnames.forEach(function(hostname) {
      var tags = Object.keys(sites[hostname]);
      tags.forEach(function(tag) {
        logger.info('ensuring exists: %s->%s', hostname, tag);
        outstanding++;
        db.tags.ensureExists({ name: tag, hostname: hostname })
          .then(function(tagModel) {
            tagModel.total_hits += + sites[hostname][tag];
            console.log('%s->%s total hits: %s',
                          hostname, tagModel.name, tagModel.total_hits);
            return db.tags.update(tagModel);
          })
          .then(function () {
            outstanding--;
            console.log('remaining tags to write: %s', outstanding);
            if (!outstanding) resolver.fulfill();
          })
          .then(null, function(err) {
            logger.error('error updating: %s->%s', hostname, tag);
          });
      });
    });

    return resolver.promise;
  })
  .then(function() {
    process.exit(0);
  });
