/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  /*global RD, chai, describe, beforeEach, afterEach, it*/
  'use strict';

  var assert = chai.assert;


  describe('RD.Graphs.Histogram', function () {

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isObject(RD.Graphs.Histogram);
    });

    it('draws', function () {
      var graph = RD.Graphs.Histogram.create();
      graph.init({
        root: '#graph',
        data: [
          1, 1, 7, 7, 7, 7, 3, 4, 5, 5, 7, 7, 7, 7, 1, 1, 0
        ]
      });
      graph.render();

      var svgEl = document.querySelector('svg');
      assert.isObject(svgEl);
      assert.notEqual(svgEl, null);
    });

  });

  function removeSvgEls() {
    var svgEls = [].slice.call(document.querySelectorAll('svg'), 0);
    svgEls.forEach(function(svgEl) {
      svgEl.parentNode.removeChild(svgEl);
    });
  }



}());

