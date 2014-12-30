/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  _handlers: {},
  on: function (eventName, cb) {
    this._handlers[eventName] = this._handlers[eventName] || [];
    this._handlers[eventName].push(cb);
  },
  fire: function (eventName) {
    var args = [].slice.call(arguments, 1);
    if (this._handlers[eventName]) {
      this._handlers[eventName].forEach(function(func) {
        func.apply(null, args);
      });
    }
  }
};

