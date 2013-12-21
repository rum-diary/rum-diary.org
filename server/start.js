/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const cors = require('cors');
const useragent = require('useragent');

const db = require('./db/json');

var app = express();

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

app.use(express.bodyParser());
app.use(cors());

app.get('/', function(req, res) {
  res.render('index.html', {
    title: 'Speed Trap!'
  });
});


app.post('/navigation', function(req, res) {
  console.log("ip", req.ip);
  console.log("referrer", req.get('referrer'));
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

  db.save(data, function(err) {
    if (null) return res.send(500);

    res.send(200, { success: true, id: req.body.uuid });
  });
});

app.get('/navigation', function(req, res) {
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
  var loadTimes = Object.keys(data).map(function(uuid) {
    try {
    var item = data[uuid].navigationTiming;
    var loadTime = item.loadEventEnd - item.navigationStart;
    } catch(e) {
      return NaN;
    }
    return loadTime;
  });
  return loadTimes;
}

function findAverageLoadTime(loadTimes) {
  var count = 0;
  return loadTimes.reduce(function(prev, curr) {
    if (isNaN(curr)) return prev;
    count++;
    return prev + curr;
  }, 0) / count;
}


app.listen(3000);
