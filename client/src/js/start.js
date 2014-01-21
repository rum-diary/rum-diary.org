/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD, DOMinator */
(function() {
  window.addEventListener('load', function() {

    hitsGraph();
    navigationTimingGraph();
    histogramGraph();

  }, false);

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
    RD.Graphs.Hits({
      __all: data
    });

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

    var graph = RD.Graphs.NavigationTiming.create();
    graph.init({
      root: '#navigation-timing-1q-graph',
      q1: navigationTiming1QData,
      q2: navigationTiming2QData,
      q3: navigationTiming3QData
    });
    graph.render();


    document.getElementById('medians').style.display = 'none';
  }

  function histogramGraph() {
    var histogramDataEls = DOMinator('#histogram-data li');
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

    console.log('min: ' + min + ' max: ' + max);

    var histogram = RD.Graphs.Histogram.create();
    histogram.init({
      root: '#histogram-graph',
      data: histogramData,
      ticks: 75
    });
    histogram.render();

    DOMinator('#histogram-data').hide();
  }

}());

