var Chef = require("../../core/Chef.js");


/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

var chef = new Chef();

console.log(chef.bake("test", [{"op":"To Hex","args":["Space"]}], {}, 0, false));
