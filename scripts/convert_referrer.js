#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// go through all of the pageViews, ensure if there is a referrer, the referrer
// is broken up into referrer_hostname and referrer_path.

const moment = require('moment');
const Promise = require('bluebird');
const db = require('../server/lib/db');
const logger = require('../server/lib/logger');


var total = 0;
db.pageView.get({
    createdAt: {
      $gte: moment('2010-01-01').toDate()
    }
  })
  .then(function(pageViews) {
    var resolver = Promise.defer();

    var outstanding = 0;
    pageViews.forEach(function(pageView) {
      if (pageView.referrer && !(pageView.referrer_hostname && pageView.referrer_path)) {
        total++;
        /*outstanding++;*/

        var parsedReferrer = url.parse(pageView.referrer);
        pageView.referrer_hostname = parsedReferrer.hostname;
        pageView.referrer_path = parsedReferrer.pathname || 'index';
        /*
        db.pageView.update(pageView)
          .then(function() {
            outstanding--;
            if (!outstanding) resolver.resolve();
          });
          */
      }
    });

    console.log('updated %s pageViews', total);

    if (! outstanding) return;

    return resolver.promise;
  })
  .then(function() {
    console.log('converted: %s', total);
    process.exit(0);
  });

