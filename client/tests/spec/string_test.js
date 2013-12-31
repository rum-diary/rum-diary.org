/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  /*global chai, describe, beforeEach, it*/
  'use strict';

  var assert = chai.assert;

  describe('RD.String', function () {
    describe('strformat', function () {
      it('replaces %s with text', function() {
        var output = RD.String.strformat('put %s on the %s', 'this', 'end');
        assert.equal(output, 'put this on the end');
      });
    });
  });

}());

