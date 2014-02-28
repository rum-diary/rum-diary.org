/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const useragent = require('useragent');
const Promise = require('bluebird');
const logger = require('../lib/logger');
const db = require('../lib/db');

exports.path = '/navigation';
exports.verb = 'post';
exports.enable_cors = true;

exports.handler = function (req, res) {
  // don't wanna be hanging around for a response.
  res.send(200, { success: true });

  // The referrer here is the page where the stats were collected,
  // not the referrer of the page where the stats were collected.
  // The referrer of the page where the stats were collection is
  // collected by the client and sent in the data set.
  var referrer = req.get('referrer');
  logger.info('saving navigation data for: %s', referrer);

  var data = req.body;

  try {
    var parsedUrl = url.parse(referrer);
    data.hostname = parsedUrl.hostname;
    data.path = parsedUrl.pathname;
  } catch(e) {}

  try {
    if (data.referrer) {
      var parsedReferrer = url.parse(data.referrer);
      data.referrer_hostname = parsedReferrer.hostname;
      data.referrer_path = parsedReferrer.pathname;
    }
  } catch(e) {
    logger.warn('error parsing referrer: %s', String(e));
  }

  var ua = useragent.parse(req.get('user-agent'));
  data.os = ua.os.toString();
  data.os_parsed = {
    family: ua.os.family,
    major: ua.os.major,
    minor: ua.os.minor
  };

  data.browser = {
    family: ua.family,
    major: ua.major,
    minor: ua.minor
  };

  if (data.tags) {
    data.tags = data.tags.reduce(function(tags, tag) {
      tag = tag && tag.trim();
      if (tag && tag.length) tags.push(tag);
      return tags;
    }, []);
  }

  return db.site.hit(data.hostname)
            .then(function () {
              data.is_counted = true;
              return db.pageView.create(data);
            })
            .then(function () {
              var resolver = Promise.defer();
              var tags = data.tags || [];
              var outstanding = tags.length;

              tags.forEach(function(tag) {
                db.tags.hit({
                    name: tag,
                    hostname: data.hostname
                  })
                  .then(function () {
                    outstanding--;
                    if (! outstanding) {
                      resolver.resolve();
                    }
                  })
                  .then(null, resolver.reject.bind(resolver));

              });

              return resolver.promise;
            })
            .then(function () {
              logger.info('data saved');
            });
};
