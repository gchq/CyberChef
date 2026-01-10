/**
 * @author Medjedtxm 
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import JsAscon from "js-ascon";

/**
 * Ascon Hash operation
 */
class AsconHash extends Operation {

    /**
     * AsconHash constructor
     */
    constructor() {
        super();

        this.name = "Ascon Hash";
        this.module = "Crypto";
        this.description = "Ascon-Hash256 produces a fixed 256-bit (32-byte) cryptographic hash as standardised in NIST SP 800-232. Ascon is a family of lightweight authenticated encryption and hashing algorithms designed for constrained devices such as IoT sensors and embedded systems.<br><br>The algorithm was selected by NIST in 2023 as the new standard for lightweight cryptography after a multi-year competition.";
        this.infoURL = "https://wikipedia.org/wiki/Ascon_(cipher)";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        const inputUint8 = new Uint8Array(input);

        // Compute hash (returns Uint8Array)
        const hashResult = JsAscon.hash(inputUint8);

        // Convert to hex string
        return toHexFast(hashResult);
    }

}

export default AsconHash;
