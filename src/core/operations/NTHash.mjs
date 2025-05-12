/**
 * @author brun0ne [brunonblok@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {runHash} from "../lib/Hash.mjs";

/**
 * NT Hash operation
 */
class NTHash extends Operation {

    /**
     * NTHash constructor
     */
    constructor() {
        super();

        this.name = "NT Hash";
        this.module = "Crypto";
        this.description = "An NT Hash, sometimes referred to as an NTLM hash, is a method of storing passwords on Windows systems. It works by running MD4 on UTF-16LE encoded input. NTLM hashes are considered weak because they can be brute-forced very easily with modern hardware.";
        this.infoURL = "https://wikipedia.org/wiki/NT_LAN_Manager";
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
        // Convert to UTF-16LE
        const buf = new ArrayBuffer(input.length * 2);
        const bufView = new Uint16Array(buf);
        for (let i = 0; i < input.length; i++) {
            bufView[i] = input.charCodeAt(i);
        }

        const hashed = runHash("md4", buf);
        return hashed.toUpperCase();
    }
}

export default NTHash;
