/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  var DOMinator = require('../lib/dominator');

  // no caching the assertion.
  DOMinator('[name=assertion]').inner('');

  // Flow:
  // 1) When user submits the form, prevent form submission and
  //    request an assertion instead.
  // 2) When an assertion arrives, disconnect the submit handler, enter
  //    the assertion into the form.
  // 3) Sign the user out of Persona, then submit the form to the server.

  // Immediately sign out upon receiving the assertion. When onlogout
  // is invoked, re-submit the form.
  navigator.id.watch({
    onlogout: function () {
      if (isFormValid()) {
        DOMinator('form').nth(0).submit();
      }
    },
    onlogin: function (assertion) {
      if (! assertion) return;

      DOMinator('#signup').unbindEvent('submit', onSubmit);
      DOMinator('[name=assertion]').inner(assertion);
      navigator.id.logout();
    }
  });

  DOMinator('#signup').bindEvent('submit', onSubmit);

  function onSubmit(event) {
    // no assertion available, request one then re-submit the form.
    event.preventDefault();
    navigator.id.request({
      siteName: 'RUM Diary'
    });
  }

  function isFormValid() {
    return !!(DOMinator('[name=name]').inner() &&
              DOMinator('[name=assertion]').inner());
  }
}());

