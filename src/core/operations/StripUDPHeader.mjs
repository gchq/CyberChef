/**
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Strip UDP header operation
 */
class StripUDPHeader extends Operation {

    /**
     * StripUDPHeader constructor
     */
    constructor() {
        super();

        this.name = "Strip UDP header";
        this.module = "Default";
        this.description = "Strips the UDP header from a UDP datagram, outputting the payload.";
        this.infoURL = "https://wikipedia.org/wiki/User_Datagram_Protocol";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const HEADER_LEN = 8;

        const s = new Stream(new Uint8Array(input));
        if (s.length < HEADER_LEN) {
            throw new OperationError("Need 8 bytes for a UDP Header");
        }

        s.moveTo(HEADER_LEN);

        return s.getBytes().buffer;
    }

}

export default StripUDPHeader;
