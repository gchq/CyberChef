/**
 * @author edouard hinard []
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {toGsm7, CHARSET_OPTIONS, EXTENSION_OPTIONS} from "../lib/Gsm7.mjs";

/**
 * ToGSM7 operation
 */
class ToGSM7 extends Operation {

    /**
     * ToGSM7 constructor
     */
    constructor() {
        super();

        this.name = "To GSM-7";
        this.module = "Default";
        this.description = "GSM-7 is a 3GPP standard (TS23.038) for SMS encoding.<br>This operation decodes a raw SMS into text.";
        this.infoURL = "https://en.wikipedia.org/wiki/GSM_03.38";
        this.inputType = "string";
        this.outputType = "byteArray";
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
                name: "CR padding",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [charset, extension, CRpad] = args;

        return toGsm7(input, charset, extension, CRpad);
    }

}

export default ToGSM7;
