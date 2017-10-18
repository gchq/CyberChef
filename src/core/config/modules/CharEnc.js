import CharEnc from "../../operations/CharEnc.js";


/**
 * CharEnc module.
 *
 * Libraries:
 *  - cptable
 *  - CryptoJS
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.CharEnc = {
    "Encode text": CharEnc.runEncode,
    "Decode text": CharEnc.runDecode,
};

export default OpModules;
