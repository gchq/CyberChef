/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";

/**
 * Hex to Object Identifier operation
 */
class HexToObjectIdentifier extends Operation {
    /**
     * HexToObjectIdentifier constructor
     */
    constructor() {
        super();

        this.name = "Hex to Object Identifier";
        this.module = "PublicKey";
        this.description =
            "Converts a hexadecimal string into an object identifier (OID).";
        this.infoURL = "https://wikipedia.org/wiki/Object_identifier";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return r.KJUR.asn1.ASN1Util.oidHexToInt(input.replace(/\s/g, ""));
    }
}

export default HexToObjectIdentifier;
