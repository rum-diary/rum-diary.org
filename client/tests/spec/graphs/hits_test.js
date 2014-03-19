/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (function () {
  /*global RD, chai, describe, beforeEach, it*/
  'use strict';

  var Hits = require('../../../src/js/graphs/hits');
  var assert = chai.assert;

  describe('Hits', function () {

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isObject(Hits);
    });

    it('draws', function () {
      var graph = Hits.create();
      graph.init({
        data: [
          {
            date: '2013-12-26',
            hits: 3
          },
          {
            date: '2013-12-27',
            hits: 5
          }
        ]
      });
      graph.render();

      var svgEl = document.querySelector('svg');
      assert.isObject(svgEl);
      assert.notEqual(svgEl, null);

      var pathEl = document.querySelector('.line');
      assert.isObject(pathEl);
      assert.notEqual(pathEl, null);
    });

  });

  function removeSvgEls() {
    var svgEls = [].slice.call(document.querySelectorAll('svg'), 0);
    svgEls.forEach(function(svgEl) {
      svgEl.parentNode.removeChild(svgEl);
    });
  }


});

