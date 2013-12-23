/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Router = require('express').Router;
const url = require('url');
const useragent = require('useragent');

const db = require('../db/db');

const reduce = require('./reduce');
const logger = require('./logger');

const router = new Router();

router.get('/', function(req, res) {
  res.render('index.html');
});

router.get('/index.html', function(req, res) {
  res.redirect(301, '/');
});


router.post('/navigation', function(req, res) {
  // don't wanna me hanging around for a response.
  res.send(200, { success: true });

  logger.info('referrer', req.get('referrer'));

  var data = req.body;
  data.ip = req.get('ip');

  data.referrer = req.get('referrer');
  try {
    var parsedUrl = url.parse(data.referrer);
    data.hostname = parsedUrl.hostname;
    data.path = parsedUrl.pathname;
  } catch(e) {}

  var ua = useragent.parse(req.get('user-agent'));
  data.os = ua.os;
  data.browser = {
    family: ua.family,
    major: ua.major,
    minor: ua.minor
  };

  db.save(data, function() {});
});


/*
router.get('/navigation', function(req, res) {
  db.get(req.hostname, function(err, data) {
    if (err) return res.send(500);

    var loadTimes = findLoadTimes(data);

    var returnData = {
      load_times: loadTimes,
      avg: findAverageLoadTime(loadTimes)
    };
    res.send(200, returnData);
  });
});
*/

router.get('/navigation/:hostname', function(req, res) {
  var hostname = req.params.hostname;
  logger.info('get information for %s', hostname);
  db.getByHostname(hostname, function(err, data) {
    if (err) return res.send(500);

    var returnData = {
      hits: reduce.pageHitsPerDay(data)
    };
    res.send(200, returnData);
  });
});

module.exports = router;

