/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var d3 = require('d3');

'use strict';

var Module = {
  create: function () {
    return Object.create(this);
  },

  init: function(options) {
    this.root = options.root || '#hits-graph';
    this.containerEl = $(this.root).get(0);
    this.data = options.data;
    this.markers = options.markers;
    this.height = options.height || 200;
  },

  render: function () {
    var containerEl = this.containerEl;
    var containerWidth = containerEl.clientWidth;

    var data = MG.convert.date(this.data, 'date');
    var markers = MG.convert.date(this.markers, 'date').map(function (item) {
      item.label = item.title;
      return item;
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
      interpolate: 'line'
    });
  }
};

module.exports = Module;

