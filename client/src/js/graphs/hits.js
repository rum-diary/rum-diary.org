/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const d3 = require('d3');
const DOM = require('dominator');
const Events = require('events');

'use strict';

class Module {
  constructor () {
  }

  static create () {
    return new this();
  }

  init (options = {}) {
    this.root = options.root || '#hits-graph';
    this.containerEl = DOM(this.root).nth(0);
    this.data = options.data;
    this.markers = options.markers;
    this.height = options.height || 200;
  }

  render () {
    let containerEl = this.containerEl;
    if (! containerEl) {
      return;
    }
    let containerWidth = containerEl.clientWidth;

    let data = MG.convert.date(this.data, 'date');
    let markers = MG.convert.date(this.markers, 'date');

    let lastIndex;

    DOM(this.root).on('click', event => {
      if (typeof lastIndex !== 'undefined') {
        let eventData = {
          data: data[lastIndex],
          x: event.screenX + 'px',
          y: event.screenY + 'px'
        };
        Events.trigger('day-click', eventData);
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
      mouseover: (data, i) => {
        lastIndex = i;
      },
      mouseout: (data, i) => {
        lastIndex = void 0;
      }
    });
  }
};

module.exports = Module;

