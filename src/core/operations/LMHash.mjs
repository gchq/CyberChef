/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {smbhash} from "ntlm";

/**
 * The LAN Manager hashing algorithm only uses the first 14 characters of the
 * uppercased password.
 */
const LM_HASH_MAX_LENGTH = 14;

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
        this.description = "An LM Hash, or LAN Manager Hash, is a deprecated way of storing passwords on old Microsoft operating systems. It is particularly weak and can be cracked in seconds on modern hardware using rainbow tables.";
        this.infoURL = "https://wikipedia.org/wiki/LAN_Manager#Password_hashing_algorithm";
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
        // Uppercase *before* truncating to 14 characters. Some characters
        // expand when uppercased (e.g. "ß" -> "SS"), and the underlying ntlm
        // library truncates first and then uppercases into a fixed 14-byte
        // buffer, overflowing it and throwing a RangeError for such inputs
        // (#1807). Normalising here preserves the library's 14-byte invariant
        // and leaves every ASCII input's hash unchanged.
        const password = input.toUpperCase().slice(0, LM_HASH_MAX_LENGTH);
        return smbhash.lmhash(password);
    }

}

export default LMHash;
