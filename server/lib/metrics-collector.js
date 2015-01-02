/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var Promises = require('bluebird');
var url = require('url');
var useragent = require('useragent');

var db = require('./db');
var logger = require('./logger');
var errorFactory = require('./error-factory');

function MetricsCollector() {
  // nothing to do here.
}

MetricsCollector.InvalidLocationError = errorFactory('InvalidLocation');
MetricsCollector.InvalidReferrerError = errorFactory('InvalidReferrer');
MetricsCollector.NonExistentSiteError = errorFactory('NonExistentSite');

MetricsCollector.prototype = {
  init: function () {
    // nothing to do here.
  },

  destroy: function () {
    // nothing to do here.
  },

  write: function (data) {
    if (! data.length) {
      data = [ data ];
    }

    return Promises.all(data.map(saveItem));
  },

  flush: function () {
    // nothing to do here.
  }
};

function saveItem(data) {
  var location = data.location;
  logger.info('saving navigation data for: %s', location);

  // TODO - check site exists before continuing.
  return db.pageView.getOne({
    uuid: data.uuid
  })
  .then(function(pageView) {
    if (pageView) {
      // update existing page view

      // TODO add events/timers
      pageView.duration = data.duration;
      return db.pageView.update(pageView);
    }

    // new page

    parseLocation(data);

    return db.site.hit(data.hostname)
        .then(function (site) {
          // site isn't yet registered, do NOT collect data.
          if (! site) {
            throw new MetricsCollector.NonExistentSiteError(data.hostname);
          }

          try {
            parseReferrer(data);
          } catch(e) {
            // swallow, not fatal.
          }

          parseUserAgent(data);
          cleanTags(data);

          data.is_counted = true;

          return Promises.all([
            db.pageView.create(data),
            // Note, this is not correct if the puuid or tags is sent
            // with the second call to /metrics for the page.
            updatePreviousPage(data),
            updateTags(data)
          ]);
        });
  })
  .then(function () {
    logger.info('data saved');
  });
}

function parseLocation(data) {
  var parsedUrl = url.parse(data.location);
  data.hostname = parsedUrl.hostname;
  data.path = parsedUrl.pathname;

  if (! data.hostname) {
    logger.warn('error parsing location: %s, cannot save data', data.location);
    throw new MetricsCollector.InvalidLocationError(data.location);
  }

}

function parseReferrer(data) {
  if (data.referrer) {
    var parsedReferrer = url.parse(data.referrer);
    data.referrer_hostname = parsedReferrer.hostname;
    data.referrer_path = parsedReferrer.pathname || '/';

    if (! data.referrer_hostname) {
      logger.warn('error parsing referrer: %s', data.referrer);
      throw new MetricsCollector.InvalidReferrerError(data.referrer);
    }
    // TODO - if puuid is sent but referrer is not, pull the previous page
    // and update accordingly.
  }
}

function parseUserAgent(data) {
  var ua = useragent.parse(data.userAgent || data.user_agent);
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
}

function cleanTags(data) {
  if (data.tags) {
    data.tags = data.tags.reduce(function(tags, tag) {
      tag = tag && tag.trim();
      if (tag && tag.length) tags.push(tag);
      return tags;
    }, []);
  }
}

function updatePreviousPage(data) {
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
           pageView.refer_to = data.location;
           pageView.refer_to_hostname = data.hostname;
           pageView.refer_to_path = data.path;
           return db.pageView.update(pageView);
         })
         .then(function() {
           logger.info('previous page updated');
         });
  }

  // no previous page, just return a null promise to simplify flow control.
  return Promises.resolve();
}

function updateTags(data) {
  var tags = data.tags || [];

  return Promises.all(tags.map(function(tag) {
    return db.tags.hit({
        name: tag,
        hostname: data.hostname
      });
  }));
}

module.exports = MetricsCollector;

