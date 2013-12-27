/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  var idEl = document.getElementById('hits');
  var hostname = idEl.getAttribute('data-hostname');

  Micrajax.ajax({
    url: '/navigation/' + hostname,
    success: function(data, respText, xhr) {
      RD.Graphs.hits(data.hits);
    },
    error: function(xhr, status, respText) {
    }
  });
}());

