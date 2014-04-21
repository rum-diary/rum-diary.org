/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promise = require('bluebird');
const url = require('url');
const useragent = require('useragent');

const db = require('../lib/db');
const inputValidation = require('../lib/input-validation');
const logger = require('../lib/logger');

exports.path = '/navigation';
exports.verb = 'post';
exports.enable_cors = true;
exports.authorization = require('../lib/page-authorization').ANY;

exports.validation = {
  uuid: inputValidation.guid(),
  puuid: inputValidation.puuid(),
  referrer: inputValidation.referrer().optional(),
  tags: inputValidation.tags().optional(),
  returning: inputValidation.boolean(),
  navigationTiming: inputValidation.navigationTiming()
};

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
      data.referrer_path = parsedReferrer.pathname || '/';
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
            .then(function (site) {
              // site isn't yet registered, do NOT collect data.
              if (! site) {
                throw new Error('site does not exist: ' + data.hostname);
              }

              data.is_counted = true;
              return db.pageView.create(data);
            })
            .then(function () {
              var resolver = Promise.defer();
              var tags = data.tags || [];
              var outstanding = tags.length;

              // no tags to update, get outta here.
              if (! outstanding) return;

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
              // If there is a previous page uuid, update the
              // previous page's exit status, and where the
              // user went.
              if (data.puuid) {
                return db.pageView.getOne({ uuid: data.puuid })
                           .then(function(pageView) {
                             if (! pageView) {
                               return;
                             }
                             pageView.is_exit = false;
                             pageView.refer_to = referrer;
                             pageView.refer_to_hostname = data.hostname;
                             pageView.refer_to_path = data.path;
                             return db.pageView.update(pageView);
                           })
                           .then(function() {
                             logger.info('previous page updated');
                           });
              }
            })
            .then(function () {
              logger.info('data saved');
            });
};
