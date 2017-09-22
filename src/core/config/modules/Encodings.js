import Punycode from "../../operations/Punycode.js";


/**
 * Encodings module.
 *
 * Libraries:
 *  - punycode
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Encodings = {
    "To Punycode":   Punycode.runToAscii,
    "From Punycode": Punycode.runToUnicode,
};

export default OpModules;
