#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// convert string only 'os' to parsed 'os_parsed'
// that contains family, major,  and minor.

const moment = require('moment');
const Promise = require('bluebird');
const db = require('../server/lib/db');

db.pageView.get({
    createdAt: {
      $gte: moment('2010-01-01').toDate()
    }
  })
  .then(function(unparsed) {
    var resolver = Promise.defer();

    updateNext();
    function updateNext() {
      var next = unparsed.shift();
      if (!next) return resolver.fulfill();

      next.os_parsed = parseOS(next.os);
      db.pageView.update(next)
        .then(updateNext);
      updateNext();
    }

    return resolver.promise;
  })
  .then(function() {
    process.exit(0);
  });

function parseOS(unparsedOS) {
  if (!unparsedOS) return;

  var versionMajor = 0;
  var versionMinor = 0;
  var versionBuild = 0;

  // try to match:
  // family major.minor.build
  // family may contain spaces
  // major is optional
  // .minor is optional
  // .build is optional
  var versionRE = /(\d+)(.\d)*$/g;
  var versionMatches = versionRE.exec(unparsedOS);
  if (versionMatches) {
    var version = versionMatches[0].split('.');
    versionMajor = version[0] || 0;
    versionMinor = version[1] || 0;
    versionBuild = version[2] || 0;
  }
  else {
    console.warn('cannot parse version number: %s', unparsedOS);
  }

  var family = unparsedOS.replace(versionRE, '').trim();

  var os = {
    family: family,
    major: versionMajor,
    minor: versionMinor,
    build: versionBuild
  };

  console.log('%s=>%s', unparsedOS, JSON.stringify(os));

  return os;
}

