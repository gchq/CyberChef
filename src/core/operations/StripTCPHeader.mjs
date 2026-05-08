/**
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Stream from "../lib/Stream.mjs";

/**
 * Strip TCP header operation
 */
class StripTCPHeader extends Operation {

    /**
     * StripTCPHeader constructor
     */
    constructor() {
        super();

        this.name = "Strip TCP header";
        this.module = "Default";
        this.description = "Strips the TCP header from a TCP segment, outputting the payload.";
        this.infoURL = "https://wikipedia.org/wiki/Transmission_Control_Protocol";
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
        const MIN_HEADER_LEN = 20;
        const DATA_OFFSET_OFFSET = 12;
        const DATA_OFFSET_LEN_BITS = 4;

        const s = new Stream(new Uint8Array(input));
        if (s.length < MIN_HEADER_LEN) {
            throw new OperationError("Need at least 20 bytes for a TCP Header");
        }

        s.moveTo(DATA_OFFSET_OFFSET);
        const dataOffsetWords = s.readBits(DATA_OFFSET_LEN_BITS);
        const dataOffsetBytes = dataOffsetWords * 4;
        if (s.length < dataOffsetBytes) {
            throw new OperationError("Input length is less than data offset");
        }

        s.moveTo(dataOffsetBytes);

        return s.getBytes().buffer;
    }

}

export default StripTCPHeader;
