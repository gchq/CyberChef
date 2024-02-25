/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { smbhash } from "ntlm";

/**
 * LM Hash operation
 */
class LMHash extends Operation {
    /**
     * LMHash constructor
     */
    constructor() {
        super();

        this.name = "LM Hash";
        this.module = "Crypto";
        this.description =
            "An LM Hash, or LAN Manager Hash, is a deprecated way of storing passwords on old Microsoft operating systems. It is particularly weak and can be cracked in seconds on modern hardware using rainbow tables.";
        this.infoURL =
            "https://wikipedia.org/wiki/LAN_Manager#Password_hashing_algorithm";
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
        return smbhash.lmhash(input);
    }
}

export default LMHash;
