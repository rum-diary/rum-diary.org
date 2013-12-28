/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global RD */
(function() {
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

}());

