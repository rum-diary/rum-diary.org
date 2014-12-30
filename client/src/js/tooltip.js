/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var DOM = require('./lib/dominator');

module.exports = {
  create: function() {
    return Object.create(this);
  },

  init: function(options) {
    options = options || {};

    this.appendTo = options.appendTo || 'body';
    this.id = options.id;

    this.render();
    this.html(options.html);

    return this;
  },

  render: function() {
    this.tooltip = DOM('<div>').addClass('tooltip').appendTo('body');

    if (this.id) this.tooltip.attr('id', this.id);
  },

  root: function() {
    return this.tooltip;
  },

  html: function(html) {
    this.tooltip.inner(html);
  },

  show: function() {
    this.tooltip.show();
    var self = this;
    // the setTimeout is used to prevent the tooltip from immediately
    // being hidden if the tooltip is shown on a click.
    setTimeout(function () {
      function stopPropagation(event) {
        event.stopPropagation();
      }
      DOM(self.tooltip).bindEvent('click', stopPropagation);

      DOM('body').once('click', function hide() {
        DOM(self.tooltip).unbindEvent('click', stopPropagation);
        self.hide();
      });
    }, 10);
  },

  hide: function() {
    this.tooltip.hide();
  },

  move: function(x, y) {
    this.tooltip.style('left', x).style('top', y);
  }
};

