/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var d3 = require('d3');

var Module = {
  create: function () {
    return Object.create(this);
  },

  init: function(options) {
    this.root = options.root || '#hits-graph';
    this.containerEl = $(this.root).get(0);
    this.data = options.data;
    this.height = options.height || 200;
  },

  render: function () {
    var containerEl = this.containerEl;
    var containerWidth = containerEl.clientWidth;

    var data = convert_dates(this.data, 'date');

    data_graphic({
      top: 30,
      right: 0,
      bottom: 30,
      left: 0,
      target: this.root,
      data: data,
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

