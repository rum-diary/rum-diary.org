/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const DOM = require('dominator');

function stopPropagation(event) {
  event.stopPropagation();
}

class Module {
  constructor () {
  }

  static create () {
    return new this();
  }

  init (options = {}) {
    options = options || {};

    this.appendTo = options.appendTo || 'body';
    this.id = options.id;

    this.render();
    this.html(options.html);

    return this;
  }

  render () {
    this.tooltip = DOM('<div>').addClass('tooltip').appendTo('body');

    if (this.id) {
      this.tooltip.attr('id', this.id);
    }
  }

  root () {
    return this.tooltip;
  }

  html (html) {
    this.tooltip.html(html);
  }

  show () {
    this.tooltip.show();
    DOM(this.tooltip).on('click', stopPropagation);

    DOM('body').once('click', () => {
      DOM(this.tooltip).off('click', stopPropagation);
      this.hide();
    });
  }

  hide () {
    this.tooltip.hide();
  }

  move (x, y) {
    this.tooltip.style('left', x).style('top', y);
  }
}

module.exports = Module;

