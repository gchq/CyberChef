/**
 * @author piggymoe [me@piggy.moe]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * From Baudot Code operation
 */
class FromBaudotCode extends Operation {

    /**
     * FromBaudotCode constructor
     */
    constructor() {
        super();

        this.name = "From Baudot Code";
        this.module = "Default";
        this.description = "Translates Baudot code to (upper case) characters using International Telegraph Alphabet No. 2 (ITA2).";
        this.infoURL = "https://wikipedia.org/wiki/Baudot_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Endianness",
                "type": "option",
                "value": ["Big-endian", "Little-endian"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const isLittleEndian = args[0] === "Little-endian";

        let output = "";

        let currentTable = LETTER_TABLE;
        let bits = 0;
        let value = 0;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (char !== "0" && char !== "1") {
                continue;
            }
            if (!isLittleEndian) {
                value = value * 2 + parseInt(char, 2);
            } else {
                value = (parseInt(char, 2) << bits) + value;
            }
            bits++;
            if (bits === 5) {
                switch (value) {
                    case LETTER_TABLE.marker:
                        currentTable = LETTER_TABLE;
                        break;
                    case FIGURE_TABLE.marker:
                        currentTable = FIGURE_TABLE;
                        break;
                    default:
                        output += currentTable.data[value];
                }
                bits = 0;
                value = 0;
            }
        }

        return output;
    }

}

const LETTER_TABLE = {
    marker: 0x1f,
    data: "\x00\x45\x0a\x41\x20\x53\x49\x55\x0d\x44\x52\x4a\x4e\x46\x43\x4b\x54\x5a\x4c\x57\x48\x59\x50\x51\x4f\x42\x47\x0e\x4d\x58\x56\x0f"
};

const FIGURE_TABLE = {
    marker: 0x1b,
    data: "\x00\x33\x0a\x2d\x20\x27\x38\x37\x0d\x05\x34\x07\x2c\x21\x3a\x28\x35\x2b\x29\x32\xa3\x36\x30\x31\x39\x3f\x26\x0e\x2e\x2f\x3d\x0f"
};

export default FromBaudotCode;
