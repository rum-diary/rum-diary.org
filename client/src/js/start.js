/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global RD */
(function() {
  window.addEventListener('load', function() {
    // Get data from the HTML
    var dayEls = [].slice.call(document.querySelectorAll('.hits-data-day'), 0);
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


    var navigationTimingEls = [].slice.call(document.querySelectorAll('.navigation-timing-row'));
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

    var navigationTimingGraph = RD.Graphs.NavigationTiming.create();
    navigationTimingGraph.init({
      root: '#navigation-timing-1q-graph',
      q1: navigationTiming1QData,
      q2: navigationTiming2QData,
      q3: navigationTiming3QData
    });
    navigationTimingGraph.render();


    document.getElementById('medians').style.display = 'none';
  }, false);

}());

