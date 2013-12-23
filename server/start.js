/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const useragent = require('useragent');
const spdy = require('spdy');

const config = require('./lib/config');
const logger = require('./lib/logger');

const db = require('./db/db');

/*
var httpServer = express();

httpServer.get('*', function(req, res) {
  if (req.secure) {
    return next();
  }
  res.redirect('https://' + req.headers.host + req.url);
});
httpServer.listen(80);
O*/
var spdyServer = express();

nunjucks.configure(config.get('views_dir'), {
  autoescape: true,
  express: spdyServer
});
spdyServer.use(express.bodyParser());
spdyServer.use(cors());

spdyServer.get('/', function(req, res) {
  res.render('index.html', {
    title: 'Speed Trap!'
  });
});


spdyServer.post('/navigation', function(req, res) {
  logger.info('ip', req.ip);
  logger.info('referrer', req.get('referrer'));
  var data = req.body;
  data.referrer = req.get('referrer');
  data.ip = req.get('ip');

  var ua = useragent.parse(req.get('user-agent'));

  data.os = ua.os;
  data.browser = {
    family: ua.family,
    major: ua.major,
    minor: ua.minor
  };

  db.save(data, function() {
    if (null) return res.send(500);

    res.send(200, { success: true, id: req.body.uuid });
  });
});

spdyServer.get('/navigation', function(req, res) {
  db.get(function(err, data) {
    if (null) return res.send(500);

    var loadTimes = findLoadTimes(data);

    var returnData = {
      load_times: loadTimes,
      avg: findAverageLoadTime(loadTimes)
    };
    res.send(200, returnData);
  });
});

function findLoadTimes(data) {
  var loadTimes = data.map(function(item) {
  var loadTime;
  try {
    var navigationTiming = item.navigationTiming;
    loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
    } catch(e) {
      return NaN;
    }
    return loadTime;
  });
  return loadTimes;
}

function findAverageLoadTime(loadTimes) {
  var count = 0;
  var total = loadTimes.reduce(function(prev, curr) {
    if (isNaN(curr)) return prev;
    count++;
    return prev + curr;
  }, 0);

  if (count) return total / count;
  return 0;
}

var spdyOptions = {
  key: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.key')),
  cert: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.bundle')),
  ssl: config.get('ssl'),
  plain: true
};

spdy.createServer(spdyOptions, spdyServer).listen(config.get('port'), function() {
  logger.info('listening on port', config.get('port'));
});

