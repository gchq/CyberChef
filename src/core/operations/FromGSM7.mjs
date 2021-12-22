/**
 * @author edouard hinard []
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {fromGsm7, CHARSET_OPTIONS, EXTENSION_OPTIONS} from "../lib/Gsm7.mjs";

/**
 * FromGSM7 operation
 */
class FromGSM7 extends Operation {

    /**
     * FromGSM7 constructor
     */
    constructor() {
        super();

        this.name = "From GSM-7";
        this.module = "Default";
        this.description = "GSM-7 is a 3GPP standard (TS23.038) for SMS encoding.<br>This operation decodes a raw SMS into text.";
        this.infoURL = "https://en.wikipedia.org/wiki/GSM_03.38";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                name: "Charset",
                type: "populateOption",
                value: CHARSET_OPTIONS
            },
            {
                name: "Extension",
                type: "populateOption",
                value: EXTENSION_OPTIONS
            },
            {
                name: "remove CR padding",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [charset, extension, CRpad] = args;

        return fromGsm7(input, charset, extension, CRpad);
    }
}

export default FromGSM7;
