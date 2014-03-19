/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (function () {
  /*global RD, chai, describe, beforeEach, afterEach, it*/
  'use strict';

  var CDF = require('../../../src/js/graphs/cdf');
  var assert = chai.assert;


  describe('CDF', function () {

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isObject(CDF);
    });

    it('draws', function () {
      var graph = CDF.create();
      graph.init({
        root: '#graph',
        data: [
          { x: 1, y: .05 },
          { x: 2, y: .5 },
          { x: 3, y: .55 },
          { x: 4, y: .65 },
          { x: 5, y: .75 },
          { x: 6, y: .85 },
          { x: 7, y: .95 },
          { x: 8, y: .99 }
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



});



