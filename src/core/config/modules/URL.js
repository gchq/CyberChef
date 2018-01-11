import URL_ from "../../operations/URL.js";


/**
 * URL module.
 *
 * Libraries:
 *  - Utils.js
 *  - url
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.URL = {
    "URL Encode": URL_.runTo,
    "URL Decode": URL_.runFrom,
    "Parse URI":  URL_.runParse,
};

export default OpModules;
