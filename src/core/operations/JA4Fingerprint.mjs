/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {toJA4} from "../lib/JA4.mjs";

/**
 * JA4 Fingerprint operation
 */
class JA4Fingerprint extends Operation {

    /**
     * JA4Fingerprint constructor
     */
    constructor() {
        super();

        this.name = "JA4 Fingerprint";
        this.module = "Crypto";
        this.description = "Generates a JA4 fingerprint to help identify TLS clients based on hashing together values from the Client Hello.<br><br>Input: A hex stream of the TLS or QUIC Client Hello packet application layer.";
        this.infoURL = "https://medium.com/foxio/ja4-network-fingerprinting-9376fe9ca637";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "Base64", "Raw"]
            },
            {
                name: "Output format",
                type: "option",
                value: ["JA4", "JA4 Original Rendering", "JA4 Raw", "JA4 Raw Original Rendering", "All"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat, outputFormat] = args;
        input = Utils.convertToByteArray(input, inputFormat);
        const ja4 = toJA4(new Uint8Array(input));

        // Output
        switch (outputFormat) {
            case "JA4":
                return ja4.JA4;
            case "JA4 Original Rendering":
                return ja4.JA4_o;
            case "JA4 Raw":
                return ja4.JA4_r;
            case "JA4 Raw Original Rendering":
                return ja4.JA4_ro;
            case "All":
            default:
                return `JA4:    ${ja4.JA4}
JA4_o:  ${ja4.JA4_o}
JA4_r:  ${ja4.JA4_r}
JA4_ro: ${ja4.JA4_ro}`;
        }
    }

}

export default JA4Fingerprint;
