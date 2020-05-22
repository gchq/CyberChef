/**
 * Export the main ESM module as CommonJS
 *
 *
 * @author d98762656 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

/* eslint no-global-assign: ["off"] */
require = require("esm")(module);
module.exports = require("./index.mjs");
module.exports.File = require("./File.mjs");
