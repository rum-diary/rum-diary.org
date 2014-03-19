/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (function () {
  /*global RD, chai, describe, beforeEach, afterEach, it*/
  'use strict';

  var Pie = require('../../../src/js/graphs/pie');
  var assert = chai.assert;


  describe('Pie', function () {
    var data = [
          { title: 'Chrome', value: 1178 },
          { title: 'Firefox', value: 675 },
          { title: 'Chrome Mobile', value: 42 },
          { title: 'Other', value: 4 },
          { title: 'Chromium', value: 15 },
          { title: 'Safari', value: 61 },
          { title: 'Amazon Silk', value: 3 },
          { title: 'IE', value: 48 },
          { title: 'Iceweasel', value: 14 },
          { title: 'Chrome Mobile iOS', value: 7 },
          { title: 'Mobile Safari', value: 44 },
          { title: 'Android', value: 8 },
          { title: 'Opera', value: 6 },
          { title: 'Iron', value: 5 },
          { title: 'Thunderbird', value: 5 },
          { title: 'Firefox Mobile', value: 9 },
          { title: 'Yandex Browser', value:	1 },
          { title: 'IE Mobile', value:1 }
        ];

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isObject(Pie);
    });

    it('draws', function () {
      var graph = Pie.create();
      graph.init({
        root: '#graph',
        data: data
      });
      graph.render();

      var svgEl = document.querySelector('svg');
      assert.isObject(svgEl);
      assert.notEqual(svgEl, null);

      assert.equal(document.querySelectorAll('.slice').length, data.length);
    });

  });

  function removeSvgEls() {
    var svgEls = [].slice.call(document.querySelectorAll('svg'), 0);
    svgEls.forEach(function(svgEl) {
      svgEl.parentNode.removeChild(svgEl);
    });
  }



});

