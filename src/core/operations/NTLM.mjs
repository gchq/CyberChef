/**
 * @author brun0ne [brunonblok@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

import cptable from "codepage";
import {runHash} from "../lib/Hash.mjs";

/**
 * NTLM operation
 */
class NTLM extends Operation {

    /**
     * NTLM constructor
     */
    constructor() {
        super();

        this.name = "NTLM";
        this.module = "Crypto";
        this.description = "Performs NTLM hashing on the input. It works by running MD4 on UTF16LE-encoded input. NTLM hashes are considered weak because they can be brute-forced very easily with modern hardware.";
        this.infoURL = "https://en.wikipedia.org/wiki/NT_LAN_Manager";
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
        const format = 1200;
        const encoded = cptable.utils.encode(format, input);
        const hashed = runHash("md4", encoded);

        return hashed.toUpperCase();
    }
}

export default NTLM;
