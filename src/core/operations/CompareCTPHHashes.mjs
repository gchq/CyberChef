/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { HASH_DELIM_OPTIONS } from "../lib/Delim.mjs";
import ctphjs from "ctph.js";
import OperationError from "../errors/OperationError.mjs";

/**
 * Compare CTPH hashes operation
 */
class CompareCTPHHashes extends Operation {
    /**
     * CompareCTPHHashes constructor
     */
    constructor() {
        super();

        this.name = "Compare CTPH hashes";
        this.module = "Crypto";
        this.description
            = "Compares two Context Triggered Piecewise Hashing (CTPH) fuzzy hashes to determine the similarity between them on a scale of 0 to 100.";
        this.infoURL = "https://forensics.wiki/context_triggered_piecewise_hashing/";
        this.inputType = "string";
        this.outputType = "Number";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": HASH_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Number}
     */
    run(input, args) {
        const samples = input.split(Utils.charRep(args[0]));
        if (samples.length !== 2) throw new OperationError("Incorrect number of samples.");
        return ctphjs.similarity(samples[0], samples[1]);
    }
}

export default CompareCTPHHashes;
