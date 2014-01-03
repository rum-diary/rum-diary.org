/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD*/

RD.Tooltip = (function() {
  'use strict';

  var DOM = window.DOMinator;

  var Module = {
    init: function(options) {
      options = options || {};

      this.appendTo = options.appendTo || 'body';
      this.id = options.id;

      this.render();
      this.html(options.html);

      return this;
    },

    render: function() {
      this.tooltip = DOM('<div>')
        .style('position', 'absolute')
        .style('z-index', '10')
        .hide()
        .appendTo('body');

      if (this.id) this.tooltip.attr('id', this.id);
    },

    html: function(html) {
      this.tooltip.inner(html);
    },

    show: function() {
      this.tooltip.show();
    },

    hide: function() {
      this.tooltip.hide();
    },

    move: function(x, y) {
      this.tooltip.style('left', x).style('top', y);
    }
  };

  Module.create = function() {
    return Object.create(Module);
  };

  return Module;

}());

