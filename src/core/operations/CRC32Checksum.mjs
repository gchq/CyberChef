/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import JSCRC from "js-crc";

/**
 * CRC-32 Checksum operation
 */
class CRC32Checksum extends Operation {
    /**
     * CRC32Checksum constructor
     */
    constructor() {
        super();

        this.name = "CRC-32 Checksum";
        this.module = "Crypto";
        this.description
            = "A cyclic redundancy check (CRC) is an error-detecting code commonly used in digital networks and storage devices to detect accidental changes to raw data.<br><br>The CRC was invented by W. Wesley Peterson in 1961; the 32-bit CRC function of Ethernet and many other standards is the work of several researchers and was published in 1975.";
        this.infoURL = "https://wikipedia.org/wiki/Cyclic_redundancy_check";
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
        return JSCRC.crc32(input);
    }
}

export default CRC32Checksum;
