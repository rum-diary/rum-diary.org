/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  require('./spec/string_test.js')();
  require('./spec/tooltip_test.js')();

  require('./spec/graphs/cdf_test.js')();
  require('./spec/graphs/histogram_test.js')();
  require('./spec/graphs/hits_test.js')();
  require('./spec/graphs/navigation-timing_test.js')();
  require('./spec/graphs/pie_test.js')();

  window.addEventListener('load', function() {
    if (navigator.userAgent.indexOf('PhantomJS') < 0) {
      mocha.run();
    }
  }, false);
}());
