/**
 * Export the main ESM module as CommonJS
 *
 *
 * @author d98762656 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

module.exports = (async () => await import("./index.mjs"))();
module.exports.File = (async () => await import("./File.mjs"))();
