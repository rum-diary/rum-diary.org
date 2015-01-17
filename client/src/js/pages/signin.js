/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  var DOM = require('dominator');

  // no caching the assertion.
  DOM('[name=assertion]').val('');

  // Flow:
  // 1) When user submits the form, prevent form submission and
  //    request an assertion instead.
  // 2) When an assertion arrives, disconnect the submit handler, enter
  //    the assertion into the form.
  // 3) Sign the user out of Persona, then submit the form to the server.

  DOM('#signin').on('submit', onSignInSubmit);

  function onSignInSubmit(event) {
    // no assertion available, request one then re-submit the form.
    event.preventDefault();

    // Immediately sign out upon receiving the assertion. When onlogout
    // is invoked, re-submit the form.
    navigator.id.watch({
      onlogout: function () {
        if (isSignInFormValid()) {
          DOM('#signin').nth(0).submit();
        }
      },
      onlogin: function (assertion) {
        if (! assertion) return;

        DOM('#signin').off('submit', onSignInSubmit);
        DOM('#signin [name=assertion]').val(assertion);
        navigator.id.logout();
      }
    });

    navigator.id.request({
      siteName: 'RUM Diary',
      backgroundColor: '#ffa200'
    });
  }

  function isSignInFormValid() {
    return !!DOM('#signin [name=assertion]').val();
  }

  DOM('#signup').on('submit', onSignUpSubmit);

  function onSignUpSubmit(event) {
    // no assertion available, request one then re-submit the form.
    event.preventDefault();

    // Immediately sign out upon receiving the assertion. When onlogout
    // is invoked, re-submit the form.
    navigator.id.watch({
      onlogout: function () {
        if (isSignUpFormValid()) {
          DOM('#signup').nth(0).submit();
        }
      },
      onlogin: function (assertion) {
        if (! assertion) return;

        DOM('#signup').off('submit', onSignUpSubmit);
        DOM('#signup [name=assertion]').val(assertion);
        navigator.id.logout();
      }
    });

    navigator.id.request({
      siteName: 'RUM Diary',
      backgroundColor: '#ffa200'
    });
  }

  function isSignUpFormValid() {
    return !!(DOM('#signup [name=name]').val() &&
              DOM('#signup [name=assertion]').val());
  }
}());

