/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {calculateTCPIPChecksum} from "../lib/Ip.mjs";

/**
 * TCP/IP Checksum operation
 */
class TCPIPChecksum extends Operation {

    /**
     * TCP/IPChecksum constructor
     */
    constructor() {
        super();

        this.name = "TCP/IP Checksum";
        this.module = "Hashing";
        this.description = "Calculates the checksum for a TCP (Transport Control Protocol) or IP (Internet Protocol) header from an input of raw bytes.";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return calculateTCPIPChecksum(input);
    }

}

export default TCPIPChecksum;
