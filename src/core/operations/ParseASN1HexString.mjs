/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";

/**
 * Parse ASN.1 hex string operation
 */
class ParseASN1HexString extends Operation {

    /**
     * ParseASN1HexString constructor
     */
    constructor() {
        super();

        this.name = "Parse ASN.1 hex string";
        this.module = "PublicKey";
        this.description = "Abstract Syntax Notation One (ASN.1) is a standard and notation that describes rules and structures for representing, encoding, transmitting, and decoding data in telecommunications and computer networking.<br><br>This operation parses arbitrary ASN.1 data (encoded as an hex string: use the 'To Hex' operation if necessary) and presents the resulting tree.";
        this.infoURL = "https://wikipedia.org/wiki/Abstract_Syntax_Notation_One";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Starting index",
                "type": "number",
                "value": 0
            },
            {
                "name": "Truncate octet strings longer than",
                "type": "number",
                "value": 32
            },
            {
                "name": "Wrap Input in SEQUENCE",
                "type": "boolean",
                "value": false,
                "hint": "Use this when there is extra data that needs to be decoded"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [index, truncateLen, addSequence] = args;
        let hex = input.replace(/\s/g, "").toLowerCase();
        if (addSequence) {
            let sequence = "30";
            let len = hex.length / 2;
            if (len <= 127) {
                // We can use the short form
                sequence += len.toString(16).padStart(2, "0");
            } else {
                let bytes = 0;
                let encoded = "";
                // Calculate the number of bytes needed to encode the length
                while (len > 0) {
                    bytes++;
                    // While we are at it, also build up the length
                    encoded = (len & 0xff).toString(16).padStart(2, "0") + encoded;
                    len >>= 8;
                }
                // encode the number of bytes needed for the length
                sequence += (bytes | 0x80).toString(16).padStart(2, "0");
                // add the encoded length
                sequence += encoded;
            }
            // Add the sequence + length in front of the original input
            hex = sequence + hex;
        }

        return r.ASN1HEX.dump(hex, {
            "ommit_long_octet": truncateLen
        }, index);
    }

}

export default ParseASN1HexString;
