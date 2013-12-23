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
const url = require('url');

const config = require('./lib/config');
const logger = require('./lib/logger');
const reduce = require('./lib/reduce');

const db = require('./db/db');

var spdyServer = express();

nunjucks.configure(config.get('views_dir'), {
  autoescape: true,
  express: spdyServer
});
spdyServer.use(express.bodyParser());
spdyServer.use(cors());
spdyServer.use(express.logger({
  format: 'short',
  stream: {
    write: function(x) {
      logger.info(typeof x === 'string' ? x.trim() : x);
    }
  }
}));

spdyServer.get('/', function(req, res) {
  res.render('index.html', {
    title: 'Speed Trap!'
  });
});


spdyServer.post('/navigation', function(req, res) {
  // don't wanna me hanging around for a response.
  res.send(200, { success: true });

  logger.info('referrer', req.get('referrer'));

  var data = req.body;
  data.ip = req.get('ip');

  data.referrer = req.get('referrer');
  try {
    var parsedUrl = url.parse(data.referrer);
    data.hostname = parsedUrl.hostname
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
spdyServer.get('/navigation', function(req, res) {
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

spdyServer.get('/navigation/:hostname', function(req, res) {
  var hostname = req.params.hostname;
  logger.info("get information for %s", hostname);
  db.getByHostname(hostname, function(err, data) {
    if (err) return res.send(500);

    var returnData = {
      hits: reduce.pageHitsPerDay(data)
    };
    res.send(200, returnData);
  });
});


spdyServer.use(express.static(config.get('static_dir')));


var spdyOptions = {
  key: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.key')),
  cert: fs.readFileSync(path.join(config.get('ssl_cert_dir'), 'rum-diary.org.bundle')),
  ssl: config.get('ssl'),
  plain: true
};

spdy.createServer(spdyOptions, spdyServer).listen(config.get('port'), function() {
  logger.info('listening on port', config.get('port'));
});

