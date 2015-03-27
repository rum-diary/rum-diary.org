/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  const DOM = require('dominator');
  const Pikaday = require('pikaday');

  window.addEventListener('load', () => {

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
    const enterAnnotationWidget = require('./enter-annotation.js').create();
    enterAnnotationWidget.init();
    /*enterAnnotationWidget.render();*/
  }

  function datePicker() {
    let startEl = DOM('[name=start]').nth(0);
    let startPicker = new Pikaday({
      field: startEl,
      onSelect: () => {
        startEl.value = startPicker.toString();
      },
      maxDate: new Date()
    });

    let endEl = DOM('[name=end]').nth(0);
    let endPicker = new Pikaday({
      field: endEl,
      onSelect: () => {
        endEl.value = endPicker.toString();
      },
      maxDate: new Date()
    });
  }

  function hitsGraph() {
    let data = getHits();
    let markers = getAnnotations();

    // Graph the data!
    let graph = require('./graphs/hits.js').create();
    graph.init({
      data: data,
      markers: markers
    });
    graph.render();

    DOM('#hits-data').style('display', 'none');
  }

  function getHits() {
    // Get data from the HTML
    let dayEls = [].slice.call(document.querySelectorAll('.hits-data-day'), 0);
    if (! dayEls.length) return;

    return dayEls.map(dayEl => {
      return {
        date: dayEl.querySelector('.hits-data-date').textContent,
        hits: parseInt(dayEl.querySelector('.hits-data-hits').textContent, 10)
      };
    });
  }

  function getAnnotations() {
    let annotationEls = [].slice.call(document.querySelectorAll('.annotation'), 0);
    if (! annotationEls.length) return [];

    let data = annotationEls.map((dayEl) => {
      return {
        date: dayEl.querySelector('.annotation-date').textContent,
        label: dayEl.querySelector('.annotation-title').textContent
      };
    });

    return data;
  }

  function navigationTimingGraph() {
    let navigationTimingEls = [].slice.call(document.querySelectorAll('.navigation-timing-row'));
    if (! navigationTimingEls.length) return;

    let navigationTiming1QData = {};
    let navigationTiming2QData = {};
    let navigationTiming3QData = {};
    navigationTimingEls.forEach((navigationTimingEl) => {
      let keyEl = navigationTimingEl.querySelector('.navigation-timing-key');

      let valueEl = navigationTimingEl.querySelector('.navigation-timing-first_q_value');
      navigationTiming1QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-second_q_value');
      navigationTiming2QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-third_q_value');
      navigationTiming3QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);
    });

    let graph = require('./graphs/navigation-timing.js').create();
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
    let histogramDataEls = DOM('#histogram-data li');
    if (! histogramDataEls.length) return;
    let histogramData = [];

    let min, max;

    histogramDataEls.forEach(el => {
      let text = DOM(el).html().trim();
      if (! text.length) return;
      if (isNaN(text)) return;

      let value = parseInt(text, 10);
      if (typeof min === 'undefined') min = value;
      min = Math.min(min, value);

      if (typeof max === 'undefined') max = value;
      max = Math.max(max, value);

      histogramData.push(value);
    });

    let histogram = require('./graphs/histogram.js').create();
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
    let cdfDataEls = DOM('#cdf-data tr');
    if (! cdfDataEls.length) return;
    let cdfData = [];

    cdfDataEls.forEach(rowEl => {
      let x = DOM(rowEl).find('.elapsed-time').html().trim();
      if (! x.length) return;
      if (isNaN(x)) return;

      let y = DOM(rowEl).find('.cdf').html().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      let yVal = parseFloat(y);
      // cut off at 98%, going all the way to 100% results in often very
      // skewed graphs.
      if (yVal > 0.98) return;

      cdfData.push({
        x: parseInt(x, 10),
        y: parseFloat(y)
      });
    });

    let cdf = require('./graphs/cdf.js').create();
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
    let browsersDataEls = DOM('.browsers-data-item');
    if (! browsersDataEls.length) return;
    let browsersData = [];

    browsersDataEls.forEach(rowEl => {
      let x = DOM(rowEl).find('.browsers-data-browser').html().trim();
      if (! x.length) return;

      let y = DOM(rowEl).find('.browsers-data-count').html().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      browsersData.push({
        title: x,
        value: parseInt(y, 10)
      });
    });

    let browsers = require('./graphs/horizontal-bar.js').create();
    browsers.init({
      root: '#browsers-graph',
      data: browsersData
    });
    browsers.render();

    DOM('#browsers-data').hide();
  }

  function osGraph() {
    let osDataEls = DOM('.os-data-item');
    if (! osDataEls.length) return;
    let osData = [];

    osDataEls.forEach(rowEl => {
      let x = DOM(rowEl).find('.os-data-name').html().trim();
      if (! x.length) return;

      let y = DOM(rowEl).find('.os-data-count').html().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      osData.push({
        title: x,
        value: parseInt(y, 10)
      });
    });

    let os = require('./graphs/horizontal-bar.js').create();
    os.init({
      root: '#os-graph',
      data: osData
    });
    os.render();

    DOM('#os-data').hide();
  }

  function deviceTypeGraph() {
    let rootEl = DOM('#device-type-graph');
    if (! rootEl.length) return;

    let deviceTypeData = {
      mobile: 0,
      desktop: 0
    };

    countDeviceType('mobile');
    countDeviceType('desktop');

    let deviceTypeArray = Object.keys(deviceTypeData).map(key => {
      return {
        title: key,
        value: deviceTypeData[key]
      };
    });

    let deviceType = require('./graphs/horizontal-bar.js').create();
    deviceType.init({
      root: '#device-type-graph',
      data: deviceTypeArray
    });
    deviceType.render();

    DOM('#os-data-mobile').hide();
    DOM('#os-data-desktop').hide();

    function countDeviceType(type) {
      let osDataEls = DOM('.os-data-item-' + type);
      if (! osDataEls.length) return;

      osDataEls.forEach(rowEl => {
        let y = DOM(rowEl).find('.os-data-count').html().trim();
        if (! y.length) return;
        if (isNaN(y)) return;

        deviceTypeData[type] += parseInt(y, 10);
      });
    }
  }
}());

