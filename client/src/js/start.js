/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  var DOM = require('dominator');
  var Pikaday = require('pikaday');

  window.addEventListener('load', function() {

    hitsGraph();
    createEnterAnnotationWidget();
    navigationTimingGraph();
    histogramGraph();
    cdfGraph();
    browsersGraph();
    osGraph();
    deviceTypeGraph();
    datePicker();
  }, false);

  function createEnterAnnotationWidget() {
    var enterAnnotationWidget = require('./enter-annotation.js').create();
    enterAnnotationWidget.init();
    /*enterAnnotationWidget.render();*/
  }

  function datePicker() {
    var startEl = DOM('[name=start]').nth(0);
    var startPicker = new Pikaday({
      field: startEl,
      onSelect: function() {
        startEl.value = startPicker.toString();
      },
      maxDate: new Date()
    });

    var endEl = DOM('[name=end]').nth(0);
    var endPicker = new Pikaday({
      field: endEl,
      onSelect: function() {
        endEl.value = endPicker.toString();
      },
      maxDate: new Date()
    });
  }

  function hitsGraph() {
    var data = getHits();
    var markers = getAnnotations();

    // Graph the data!
    var graph = require('./graphs/hits.js').create();
    graph.init({
      data: data,
      markers: markers
    });
    graph.render();

    DOM('#hits-data').style('display', 'none');
  }

  function getHits() {
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

    return data;
  }

  function getAnnotations() {
    var annotationEls = [].slice.call(document.querySelectorAll('.annotation'), 0);
    if (! annotationEls.length) return [];

    var data = annotationEls.map(function(dayEl) {
      var dateEl = dayEl.querySelector('.annotation-date');
      var titleEl = dayEl.querySelector('.annotation-title');

      return {
        date: dateEl.textContent,
        label: titleEl.textContent
      };
    });

    return data;
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
      width: DOM('#navigation-timing-graph').nth(0).clientWidth,
      height: '250'
    });
    graph.render();


    DOM('#medians').style('display', 'none');
  }

  function histogramGraph() {
    var histogramDataEls = DOM('#histogram-data li');
    if (! histogramDataEls.length) return;
    var histogramData = [];

    var min, max;

    histogramDataEls.forEach(function(el) {
      var text = DOM(el).html().trim();
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
      width: DOM('#histogram-graph').nth(0).clientWidth,
      height: '350'
    });
    histogram.render();

    DOM('#histogram-data').hide();
  }


  function cdfGraph() {
    var cdfDataEls = DOM('#cdf-data tr');
    if (! cdfDataEls.length) return;
    var cdfData = [];

    cdfDataEls.forEach(function(rowEl) {
      var x = DOM(rowEl).find('.elapsed-time').html().trim();
      if (! x.length) return;
      if (isNaN(x)) return;

      var y = DOM(rowEl).find('.cdf').html().trim();
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
      width: DOM('#cdf-graph').nth(0).clientWidth,
      height: '350'
    });
    cdf.render();

    DOM('#cdf-data').hide();
  }

  function browsersGraph() {
    var browsersDataEls = DOM('.browsers-data-item');
    if (! browsersDataEls.length) return;
    var browsersData = [];

    browsersDataEls.forEach(function(rowEl) {
      var x = DOM(rowEl).find('.browsers-data-browser').html().trim();
      if (! x.length) return;

      var y = DOM(rowEl).find('.browsers-data-count').html().trim();
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
      data: browsersData
    });
    browsers.render();

    DOM('#browsers-data').hide();
  }

  function osGraph() {
    var osDataEls = DOM('.os-data-item');
    if (! osDataEls.length) return;
    var osData = [];

    osDataEls.forEach(function(rowEl) {
      var x = DOM(rowEl).find('.os-data-name').html().trim();
      if (! x.length) return;

      var y = DOM(rowEl).find('.os-data-count').html().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      osData.push({
        title: x,
        value: parseInt(y, 10)
      });
    });

    var os = require('./graphs/horizontal-bar.js').create();
    os.init({
      root: '#os-graph',
      data: osData
    });
    os.render();

    DOM('#os-data').hide();
  }

  function deviceTypeGraph() {
    var rootEl = DOM('#device-type-graph');
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

    var deviceType = require('./graphs/horizontal-bar.js').create();
    deviceType.init({
      root: '#device-type-graph',
      data: deviceTypeArray
    });
    deviceType.render();

    DOM('#os-data-mobile').hide();
    DOM('#os-data-desktop').hide();

    function countDeviceType(type) {
      var osDataEls = DOM('.os-data-item-' + type);
      if (! osDataEls.length) return;

      osDataEls.forEach(function(rowEl) {
        var y = DOM(rowEl).find('.os-data-count').html().trim();
        if (! y.length) return;
        if (isNaN(y)) return;

        deviceTypeData[type] += parseInt(y, 10);
      });
    }

  }


}());

