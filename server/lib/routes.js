/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const Triage = require('triage');

const Router = require('express').Router;
const router = new Router();

const ROUTES_DIR = path.join(__dirname, '..', 'routes');

var triage = new Triage();
triage.init({
  cwd: ROUTES_DIR,
  router: router
});

module.exports = router;
