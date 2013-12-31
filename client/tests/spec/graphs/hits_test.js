/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function () {
  /*global RD, chai, describe, beforeEach, it*/
  'use strict';

  var assert = chai.assert;

  describe('RD.Graphs.Hits', function () {

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isFunction(window.RD.Graphs.Hits);
    });

    it('draws', function () {
      window.RD.Graphs.Hits({
        __all: [
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


}());

