/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const DOM = require('dominator');
const Tooltip = require('./tooltip');
const Events = require('events');
const { format: strformat, padLeft } = require('string-utils');
const { delay } = require('function-utils');

class EnterAnnotation {
  constructor () {
  }

  static create () {
    return new this();
  }

  init (options) {
    options = options || {};
    this.root = options.root || '#enter-annotation-container';
    DOM('#annotations').hide();

    // the delay is used to prevent the tooltip from immediately
    // being hidden if the tooltip is shown on a click.
    Events.on('day-click', delay(eventData => {
      this.show(eventData.data, eventData.x, eventData.y);
    }));
  }

  render () {
    let html = DOM(this.root).html();
    DOM(this.root).remove();

    let tooltip = this._tooltip = Tooltip.create();
    tooltip.init({
      html: html
    });

  }

  show (data, x, y) {
    if (! this._tooltip) {
      this.render();
    }

    let tooltip = this._tooltip;
    tooltip.show();
    tooltip.move(x, y);

    let occurredAt = data.date;
    let occurredAtStr = strformat('%s-%s-%s',
      occurredAt.getFullYear(),
      occurredAt.getMonth() + 1,
      padLeft(occurredAt.getDate(), 2, 0));
    DOM(this._tooltip.root()).find('[name="occurredAt"]').attr('value', occurredAtStr);
    DOM('#occurredAtContainer').hide();
  }
}

module.exports = EnterAnnotation;


