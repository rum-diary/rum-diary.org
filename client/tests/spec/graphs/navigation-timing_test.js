/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  /*global RD, chai, describe, beforeEach, afterEach, it*/
  'use strict';

  var assert = chai.assert;

  var navigationTimingData = {'navigationStart':0,'redirectStart':0,'redirectEnd':0,'redirectDuration':0,'fetchStart':0,'domainLookupStart':1,'domainLookupEnd':2,'domainLookupDuration':0,'connectStart':2,'secureConnectionStart':0,'connectEnd':27,'connectDuration':0,'requestStart':64,'responseStart':263,'responseEnd':266,'requestResponseDuration':118,'unloadEventStart':159,'unloadEventEnd':160,'unloadEventDuration':0,'domLoading':175,'domInteractive':444,'domContentLoadedEventStart':446,'domContentLoadedEventEnd':446,'domContentLoadedEventDuration':2,'domComplete':529,'loadEventStart':529,'loadEventEnd':532,'loadEventDuration':4,'processingDuration':235};

  describe('RD.Graphs.NavigationTiming', function () {

    beforeEach(function() {
      removeSvgEls();
    });

    afterEach(function() {
      removeSvgEls();
    });

    it('exists', function () {
      assert.isObject(RD.Graphs.NavigationTiming);
    });

    it('draws', function () {
      var graph = RD.Graphs.NavigationTiming.create();
      graph.init({
        q1: navigationTimingData
      });
      graph.render();

      var svgEl = document.querySelector('svg');
      assert.isObject(svgEl);
      assert.notEqual(svgEl, null);

      var sectionEls = document.querySelectorAll('.section');
      assert.equal(sectionEls.length, 8);
    });

  });

  function removeSvgEls() {
    var svgEls = [].slice.call(document.querySelectorAll('svg'), 0);
    svgEls.forEach(function(svgEl) {
      svgEl.parentNode.removeChild(svgEl);
    });
  }



}());

