/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (function () {
  /*global chai, describe, beforeEach, it*/
  "use strict";

  var Tooltip = require('../../src/js/tooltip');

  var assert = chai.assert;

  describe('Tooltip', function () {
    beforeEach(function() {
      this.tooltip = Tooltip.create();
      this.tooltip.init({
        appendTo: 'body',
        html: 'this is the tooltip',
        id: 'tooltip'
      });
    });

    afterEach(function() {
      var tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.parentElement.removeChild(tooltip);
    });

    it('can be created', function() {
      var tooltip = document.getElementById('tooltip');
      assert.equal(tooltip.textContent, 'this is the tooltip');
    });

    it('can be shown', function() {
      this.tooltip.show();

      var tooltip = document.getElementById('tooltip');
      assert.notEqual(
          window.getComputedStyle(tooltip).getPropertyValue('display'), 'none');
    });

    it('can be hidden', function() {
      this.tooltip.hide();

      var tooltip = document.getElementById('tooltip');
      assert.equal(
          window.getComputedStyle(tooltip).getPropertyValue('display'), 'none');
    });

    it('can have its text changed', function() {
      this.tooltip.html('this is the new <b>html</b>');

      var tooltip = document.getElementById('tooltip');
      assert.equal(tooltip.innerHTML, 'this is the new <b>html</b>');
    });

    it('can be moved', function() {
      this.tooltip.move(5 + 'px', 10 + 'px');

      var tooltip = document.getElementById('tooltip');
      var computedStyle = window.getComputedStyle(tooltip);

      assert.equal(computedStyle.getPropertyValue('left'), '5px');
      assert.equal(computedStyle.getPropertyValue('top'), '10px');
    });
  });
});

