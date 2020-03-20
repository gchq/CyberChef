/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";

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
        this.checks = {
            input: {
                regex: [
                    {
                        match:  "^\\s*([0-9]{1,3}\\.)+[0-9]{1,3}\\s*$",
                        flags:  "",
                        args:   []
                    }
                ]
            }
        };
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return r.KJUR.asn1.ASN1Util.oidIntToHex(input);
    }

}

export default ObjectIdentifierToHex;
