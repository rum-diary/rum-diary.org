/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var d3 = require('d3');
var DOM = require('dominator');
var Events = require('events');

'use strict';

var Module = {
  create: function () {
    return Object.create(this);
  },

  init: function(options) {
    this.root = options.root || '#hits-graph';
    this.containerEl = DOM(this.root).nth(0);
    this.data = options.data;
    this.markers = options.markers;
    this.height = options.height || 200;
  },

  render: function () {
    var containerEl = this.containerEl;
    if (! containerEl) {
      return;
    }
    var containerWidth = containerEl.clientWidth;

    var data = MG.convert.date(this.data, 'date');
    var markers = MG.convert.date(this.markers, 'date');

    var lastIndex;

    DOM(this.root).on('click', function (event) {
      if (typeof lastIndex !== 'undefined') {
        Events.trigger('day-click', data[lastIndex]);
      }
    });

    MG.data_graphic({
      top: 30,
      right: 0,
      bottom: 30,
      left: 0,
      target: this.root,
      data: data,
      markers: markers,
      width: containerWidth,
      height: this.height,
      x_accessor: 'date',
      x_extend_ticks: true,
      y_accessor: 'hits',
      y_axis: false,
      interpolate: 'line',
      show_rollover_text: true,
      mouseover: function (data, i) {
        lastIndex = i;
      },
      mouseout: function (data, i) {
        lastIndex = void 0;
      }
    });
  }
};

module.exports = Module;

