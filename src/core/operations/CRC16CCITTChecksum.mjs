/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * CRC-16-CCITT Checksum operation
 */
class CRC16CCITTChecksum extends Operation {

    /**
     * CRC16CCITTChecksum constructor
     */
    constructor() {
        super();

        this.name = "CRC-16-CCITT Checksum";
        this.module = "Crypto";
        this.description = "Another version of CRC-16, used in XMODEM/YMODEM protocol.";
        this.infoURL = "https://wikipedia.org/wiki/Cyclic_redundancy_check";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
        ];

        this.crcTable = [];
        for (let i = 0; i < 256; i++) {
            let value = i << 8;
            for (let j = 0; j < 8; j++) {
                value <<= 1;
                if (value & 0x10000) value ^= 0x1021;
                value &= 0xffff;
            }
            this.crcTable.push(value);
        }
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (ArrayBuffer.isView(input)) {
            input = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
        } else {
            input = new Uint8Array(input);
        }
        let crc = 0;
        for (let i = 0; i < input.length; i++) {
            crc = ((crc << 8) ^ this.crcTable[((crc >> 8) ^ input[i]) & 0xff]) & 0xffff;
        }
        return Utils.hex(crc, 4);
    }

}

export default CRC16CCITTChecksum;
