/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { oidIntToHex } from "../lib/Asn1.mjs";

/**
 * Object Identifier to Hex operation
 */
class ObjectIdentifierToHex extends Operation {

    /**
     * ObjectIdentifierToHex constructor
     */
    constructor() {
        super();

        this.name = "Object Identifier to Hex";
        this.module = "PublicKey";
        this.description = "Converts an object identifier (OID) into a hexadecimal string.";
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
        return oidIntToHex(input);
    }

}

export default ObjectIdentifierToHex;
