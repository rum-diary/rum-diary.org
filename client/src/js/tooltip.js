/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD, d3*/

RD.Tooltip = (function() {
  'use strict';

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
      this.tooltip = d3.select(this.appendTo)
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('display', 'none');

      if (this.id) this.tooltip.attr('id', this.id);
    },

    html: function(html) {
      this.tooltip.html(html);
    },

    show: function() {
      this.tooltip.style('display', 'block');
    },

    hide: function() {
      this.tooltip.style('display', 'none');
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

