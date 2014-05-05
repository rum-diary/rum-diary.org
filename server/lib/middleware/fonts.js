/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Set up the font serving middleware.

const connect_fonts = require('connect-fonts');
const connect_fonts_vera_sans = require('connect-fonts-bitstream-vera-sans');

const config = require('../config');

module.exports = function () {
  return connect_fonts.setup({
    fonts: [ connect_fonts_vera_sans ],
    allow_origin: config.get('hostname'),
    maxage: 180 * 24 * 60 * 60 * 1000,   // 180 days
    compress: true
  });
};

