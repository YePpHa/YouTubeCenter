/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { merge } = require('sdk/util/object');
const app = require("sdk/system/xul-app");
const { isGlobalPBSupported } = require('sdk/private-browsing/utils');

merge(module.exports,
  require('./test-windows'),
  require('./test-tabs'),
  require('./test-page-mod'),
  require('./test-selection'),
  require('./test-panel'),
  require('./test-private-browsing'),
  isGlobalPBSupported ? require('./test-global-private-browsing') : {}
);

require('sdk/test/runner').runTestsFromModule(module);
