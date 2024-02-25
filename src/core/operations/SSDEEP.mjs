/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import ssdeepjs from "ssdeep.js";

/**
 * SSDEEP operation
 */
class SSDEEP extends Operation {
    /**
     * SSDEEP constructor
     */
    constructor() {
        super();

        this.name = "SSDEEP";
        this.module = "Crypto";
        this.description
            = "SSDEEP is a program for computing context triggered piecewise hashes (CTPH). Also called fuzzy hashes, CTPH can match inputs that have homologies. Such inputs have sequences of identical bytes in the same order, although bytes in between these sequences may be different in both content and length.<br><br>SSDEEP hashes are now widely used for simple identification purposes (e.g. the 'Basic Properties' section in VirusTotal). Although 'better' fuzzy hashes are available, SSDEEP is still one of the primary choices because of its speed and being a de facto standard.<br><br>This operation is fundamentally the same as the CTPH operation, however their outputs differ in format.";
        this.infoURL = "https://forensics.wiki/ssdeep";
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
        return ssdeepjs.digest(input);
    }
}

export default SSDEEP;
