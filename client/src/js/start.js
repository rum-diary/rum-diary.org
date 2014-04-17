/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  var DOMinator = require('./lib/dominator');
  var Pikaday = require('./bower_components/pikaday/pikaday');

  window.addEventListener('load', function() {

    hitsGraph();
    navigationTimingGraph();
    histogramGraph();
    cdfGraph();
    browsersGraph();
    osGraph();
    deviceTypeGraph();
    datePicker();
  }, false);

  function datePicker() {
    var startEl = DOMinator('[name=start]').nth(0);
    var startPicker = new Pikaday({
      field: startEl,
      onSelect: function() {
        startEl.value = startPicker.toString();
      },
      maxDate: new Date()
    });

    var endEl = DOMinator('[name=end]').nth(0);
    var endPicker = new Pikaday({
      field: endEl,
      onSelect: function() {
        endEl.value = endPicker.toString();
      },
      maxDate: new Date()
    });
  }

  function hitsGraph() {
    // Get data from the HTML
    var dayEls = [].slice.call(document.querySelectorAll('.hits-data-day'), 0);
    if (! dayEls.length) return;

    var data = dayEls.map(function(dayEl) {
      var dateEl = dayEl.querySelector('.hits-data-date');
      var hitsEl = dayEl.querySelector('.hits-data-hits');

      return {
        date: dateEl.textContent,
        hits: parseInt(hitsEl.textContent, 10)
      };
    });

    // Graph the data!
    var Hits = require('./graphs/hits.js');
    var graph = Hits.create();
    graph.init({
      data: data
    });
    graph.render();

    document.getElementById('hits-data').style.display = 'none';
  }

  function navigationTimingGraph() {
    var navigationTimingEls = [].slice.call(document.querySelectorAll('.navigation-timing-row'));
    if (! navigationTimingEls.length) return;

    var navigationTiming1QData = {};
    var navigationTiming2QData = {};
    var navigationTiming3QData = {};
    navigationTimingEls.forEach(function(navigationTimingEl) {
      var keyEl = navigationTimingEl.querySelector('.navigation-timing-key');

      var valueEl = navigationTimingEl.querySelector('.navigation-timing-first_q_value');
      navigationTiming1QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-second_q_value');
      navigationTiming2QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-third_q_value');
      navigationTiming3QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);
    });

    var graph = require('./graphs/navigation-timing.js').create();
    graph.init({
      root: '#navigation-timing-graph',
      data: [
        navigationTiming1QData,
        navigationTiming2QData,
        navigationTiming3QData
      ],
      width: DOMinator('#navigation-timing-graph').nth(0).clientWidth,
      height: '250'
    });
    graph.render();


    document.getElementById('medians').style.display = 'none';
  }

  function histogramGraph() {
    var histogramDataEls = DOMinator('#histogram-data li');
    if (! histogramDataEls.length) return;
    var histogramData = [];

    var min, max;

    histogramDataEls.forEach(function(el) {
      var text = DOMinator(el).inner().trim();
      if (! text.length) return;
      if (isNaN(text)) return;

      var value = parseInt(text, 10);
      if (typeof min === 'undefined') min = value;
      min = Math.min(min, value);

      if (typeof max === 'undefined') max = value;
      max = Math.max(max, value);

      histogramData.push(value);
    });

    var histogram = require('./graphs/histogram.js').create();
    histogram.init({
      root: '#histogram-graph',
      data: histogramData,
      ticks: Math.min(histogramData.length, 75),
      width: DOMinator('#histogram-graph').nth(0).clientWidth,
      height: '350'
    });
    histogram.render();

    DOMinator('#histogram-data').hide();
  }


  function cdfGraph() {
    var cdfDataEls = DOMinator('#cdf-data tr');
    if (! cdfDataEls.length) return;
    var cdfData = [];

    cdfDataEls.forEach(function(rowEl) {
      var x = DOMinator(rowEl).find('.elapsed-time').inner().trim();
      if (! x.length) return;
      if (isNaN(x)) return;

      var y = DOMinator(rowEl).find('.cdf').inner().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      var yVal = parseFloat(y);
      // cut off at 98%, going all the way to 100% results in often very
      // skewed graphs.
      if (yVal > 0.98) return;

      cdfData.push({
        x: parseInt(x, 10),
        y: parseFloat(y)
      });
    });

    var cdf = require('./graphs/cdf.js').create();
    cdf.init({
      root: '#cdf-graph',
      data: cdfData,
      width: DOMinator('#cdf-graph').nth(0).clientWidth,
      height: '350'
    });
    cdf.render();

    DOMinator('#cdf-data').hide();
  }

  function browsersGraph() {
    var browsersDataEls = DOMinator('.browsers-data-item');
    if (! browsersDataEls.length) return;
    var browsersData = [];

    browsersDataEls.forEach(function(rowEl) {
      var x = DOMinator(rowEl).find('.browsers-data-browser').inner().trim();
      if (! x.length) return;

      var y = DOMinator(rowEl).find('.browsers-data-count').inner().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      browsersData.push({
        title: x,
        value: parseInt(y, 10)
      });
    });

    var browsers = require('./graphs/horizontal-bar.js').create();
    browsers.init({
      root: '#browsers-graph',
      data: browsersData,
      width: DOMinator('#browsers-graph').nth(0).clientWidth,
      height: 250
    });
    browsers.render();

    DOMinator('#browsers-data').hide();
  }

  function osGraph() {
    var osDataEls = DOMinator('.os-data-item');
    if (! osDataEls.length) return;
    var osData = [];

    osDataEls.forEach(function(rowEl) {
      var x = DOMinator(rowEl).find('.os-data-name').inner().trim();
      if (! x.length) return;

      var y = DOMinator(rowEl).find('.os-data-count').inner().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      osData.push({
        title: x,
        value: parseInt(y, 10)
      });
    });

    var os = require('./graphs/pie.js').create();
    os.init({
      root: '#os-graph',
      data: osData,
      width: DOMinator('#os-graph').nth(0).clientWidth,
      height: '300'
    });
    os.render();

    DOMinator('#os-data').hide();
  }

  function deviceTypeGraph() {
    var rootEl = DOMinator('#device-type-graph');
    if (! rootEl.length) return;

    var deviceTypeData = {
      mobile: 0,
      desktop: 0
    };

    countDeviceType('mobile');
    countDeviceType('desktop');

    var deviceTypeArray = Object.keys(deviceTypeData).map(function(key) {
      return {
        title: key,
        value: deviceTypeData[key]
      };
    });

    var deviceType = require('./graphs/pie.js').create();
    deviceType.init({
      root: '#device-type-graph',
      data: deviceTypeArray,
      width: DOMinator('#device-type-graph').nth(0).clientWidth,
      height: '300'
    });
    deviceType.render();

    DOMinator('#os-data-mobile').hide();
    DOMinator('#os-data-desktop').hide();

    function countDeviceType(type) {
      var osDataEls = DOMinator('.os-data-item-' + type);
      if (! osDataEls.length) return;

      osDataEls.forEach(function(rowEl) {
        var y = DOMinator(rowEl).find('.os-data-count').inner().trim();
        if (! y.length) return;
        if (isNaN(y)) return;

        deviceTypeData[type] += parseInt(y, 10);
      });
    }

  }


}());

