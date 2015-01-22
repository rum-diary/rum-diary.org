#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A test script to add test annotations to the DB.

var moment = require('moment');
var Promises = require('bluebird');
var Annotation = require('../server/lib/db').annotation;

Annotation.clear()
  .then(function () {
    return Promises.all([
      Annotation.create({
        hostname: 'localhost',
        title: 'annotation 1',
        description: 'test description',
        url: 'https://shanetomlinson.com',
        occurredAt: moment().subtract(10,'days').toDate()
      }),
      Annotation.create({
        hostname: 'localhost',
        title: 'annotation 2',
        description: 'test description',
        url: 'https://shanetomlinson.com',
        occurredAt: moment().subtract(5, 'days').toDate()
      }),
      Annotation.create({
        hostname: 'localhost',
        title: 'annotation 3',
        description: 'test description',
        url: 'https://shanetomlinson.com',
        occurredAt: moment().subtract(2, 'days').toDate()
      })
    ]);
  }).then(function () {
    process.exit(0);
  });

