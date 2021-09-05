/**
 * @author piggymoe [me@piggy.moe]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Baudot Code operation
 */
class ToBaudotCode extends Operation {

    /**
     * ToBaudotCode constructor
     */
    constructor() {
        super();

        this.name = "To Baudot Code";
        this.module = "Default";
        this.description = "Translates characters into Baudot code using International Telegraph Alphabet No. 2 (ITA2).<br><br>Ignores non-Baudot characters.<br><br>e.g. <code>BAUDOT</code> becomes <code>11001 00011 00111 01001 11000 10000</code>";
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
        if (!this.initialized) {
            this.initialize();
        }

        let output = [];
        let currentTable = LETTER_TABLE;
        let anotherTable = FIGURE_TABLE;

        for (let i = 0; i < input.length; i++) {
            const char = input[i].toUpperCase();
            let signal = currentTable.reverse[char];
            if (signal !== undefined) {
                output.push(signal);
                continue;
            }
            signal = anotherTable.reverse[char];
            if (signal === undefined) {
                continue;
            }
            [currentTable, anotherTable] = [anotherTable, currentTable];
            output.push(currentTable.marker);
            output.push(signal);
        }

        if (args[0] === "Little-endian") {
            output = output.map((x) => (((x & 1) << 4) ^ ((x & 2) << 2) ^ (x & 4) ^ ((x & 8) >> 2) ^ ((x & 16) >> 4)));
        }

        return output
            .map((x) => x.toString(2).padStart(5, "0"))
            .join(" ");
    }

    /**
     * Initialize all Baudot Code lookup table
     */
    initialize() {
        this.initialized = true;
        this.initializeTable(LETTER_TABLE);
        this.initializeTable(FIGURE_TABLE);
    }

    /**
     * Initialize one Baudot Code lookup table
     * @param table the table to initialize
     */
    initializeTable(table) {
        for (let i = 0; i < table.data.length; i++) {
            const signal = table.data[i];
            table.reverse[signal] = i;
        }
    }

}

const LETTER_TABLE = {
    marker: 0x1f,
    data: "\x00\x45\x0a\x41\x20\x53\x49\x55\x0d\x44\x52\x4a\x4e\x46\x43\x4b" +
        "\x54\x5a\x4c\x57\x48\x59\x50\x51\x4f\x42\x47\x0e\x4d\x58\x56\x0f",
    reverse: {}
};

const FIGURE_TABLE = {
    marker: 0x1b,
    data: "\x00\x33\x0a\x2d\x20\x27\x38\x37\x0d\x05\x34\x07\x2c\x21\x3a\x28" +
        "\x35\x2b\x29\x32\xa3\x36\x30\x31\x39\x3f\x26\x0e\x2e\x2f\x3d\x0f",
    reverse: {}
};

export default ToBaudotCode;
