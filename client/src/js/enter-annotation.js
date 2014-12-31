/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var DOM = require('dominator');
var Tooltip = require('./tooltip');
var Events = require('events');
var StringUtils = require('string-utils');

var EnterAnnotation = {
  create: function () {
    return Object.create(this);
  },

  init: function (options) {
    options = options || {};
    this.root = options.root || '#enter-annotation-container';
    DOM('#annotations').hide();

    Events.on('point-click', this.show.bind(this));
  },

  render: function () {
    var html = DOM(this.root).html();
    DOM(this.root).remove();

    var tooltip = this._tooltip = Tooltip.create();
    tooltip.init({
      html: html
    });

  },

  show: function (data) {
    if (! this._tooltip) {
      this.render();
    }

    var tooltip = this._tooltip;
    tooltip.show();
    tooltip.move('100px', '150px');

    var occurredAt = data.date;
    var occurredAtStr = StringUtils.format('%s-%s-%s',
      occurredAt.getFullYear(),
      occurredAt.getMonth() + 1,
      StringUtils.padLeft(occurredAt.getDate(), 2, 0));
    DOM(this._tooltip.root()).find('[name="occurredAt"]').attr('value', occurredAtStr);
    DOM('#occurredAtContainer').hide();
  }
};

module.exports = EnterAnnotation;


