/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  strformat: function(input) {
    var args = [].slice.call(arguments, 1);

    var output = input.replace(/%s/g, function() {
      return args.shift();
    });

    return output;
  },

  fillLeft: function (input, width, fillWith) {
    return fill(input, width, fillWith, function (output, fillWith) {
      return fillWith + output;
    });
  },

  fillRight: function (input, width, fillWith) {
    return fill(input, width, fillWith, function (output, fillWith) {
      return output + fillWith;
    });
  }
};

function fill(input, width, fillWith, filler) {
  var output = '' + input;
  fillWith = ('' + fillWith) || ' ';
  while (output.length < width) {
    output = filler(output, fillWith);
  }
  return output;
}

