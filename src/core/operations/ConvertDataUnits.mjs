/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert data units operation
 */
class ConvertDataUnits extends Operation {
    /**
     * ConvertDataUnits constructor
     */
    constructor() {
        super();

        this.name = "Convert data units";
        this.module = "Default";
        this.description = "Converts a unit of data to another format.";
        this.infoURL = "https://wikipedia.org/wiki/Orders_of_magnitude_(data)";
        this.inputType = "BigNumber";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Input units",
                "type": "option",
                "value": DATA_UNITS
            },
            {
                "name": "Output units",
                "type": "option",
                "value": DATA_UNITS
            }
        ];
    }

    /**
     * @param {BigNumber} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const [inputUnits, outputUnits] = args;

        input = input.times(DATA_FACTOR[inputUnits]);
        return input.div(DATA_FACTOR[outputUnits]);
    }
}

const DATA_UNITS = [
    "Bits (b)",
    "Nibbles",
    "Octets",
    "Bytes (B)",
    "[Binary bits (2^n)]",
    "Kibibits (Kib)",
    "Mebibits (Mib)",
    "Gibibits (Gib)",
    "Tebibits (Tib)",
    "Pebibits (Pib)",
    "Exbibits (Eib)",
    "Zebibits (Zib)",
    "Yobibits (Yib)",
    "[/Binary bits (2^n)]",
    "[Decimal bits (10^n)]",
    "Decabits",
    "Hectobits",
    "Kilobits (Kb)",
    "Megabits (Mb)",
    "Gigabits (Gb)",
    "Terabits (Tb)",
    "Petabits (Pb)",
    "Exabits (Eb)",
    "Zettabits (Zb)",
    "Yottabits (Yb)",
    "[/Decimal bits (10^n)]",
    "[Binary bytes (8 x 2^n)]",
    "Kibibytes (KiB)",
    "Mebibytes (MiB)",
    "Gibibytes (GiB)",
    "Tebibytes (TiB)",
    "Pebibytes (PiB)",
    "Exbibytes (EiB)",
    "Zebibytes (ZiB)",
    "Yobibytes (YiB)",
    "[/Binary bytes (8 x 2^n)]",
    "[Decimal bytes (8 x 10^n)]",
    "Kilobytes (KB)",
    "Megabytes (MB)",
    "Gigabytes (GB)",
    "Terabytes (TB)",
    "Petabytes (PB)",
    "Exabytes (EB)",
    "Zettabytes (ZB)",
    "Yottabytes (YB)",
    "[/Decimal bytes (8 x 10^n)]"
];

const DATA_FACTOR = {
    // Multiples of a bit
    "Bits (b)": 1,
    "Nibbles": 4,
    "Octets": 8,
    "Bytes (B)": 8,

    // Binary bits (2^n)
    "Kibibits (Kib)": 1024,
    "Mebibits (Mib)": 1048576,
    "Gibibits (Gib)": 1073741824,
    "Tebibits (Tib)": 1099511627776,
    "Pebibits (Pib)": 1125899906842624,
    "Exbibits (Eib)": 1152921504606846976,
    "Zebibits (Zib)": 1180591620717411303424,
    "Yobibits (Yib)": 1208925819614629174706176,

    // Decimal bits (10^n)
    "Decabits": 10,
    "Hectobits": 100,
    "Kilobits (Kb)": 1e3,
    "Megabits (Mb)": 1e6,
    "Gigabits (Gb)": 1e9,
    "Terabits (Tb)": 1e12,
    "Petabits (Pb)": 1e15,
    "Exabits (Eb)": 1e18,
    "Zettabits (Zb)": 1e21,
    "Yottabits (Yb)": 1e24,

    // Binary bytes (8 x 2^n)
    "Kibibytes (KiB)": 8192,
    "Mebibytes (MiB)": 8388608,
    "Gibibytes (GiB)": 8589934592,
    "Tebibytes (TiB)": 8796093022208,
    "Pebibytes (PiB)": 9007199254740992,
    "Exbibytes (EiB)": 9223372036854775808,
    "Zebibytes (ZiB)": 9444732965739290427392,
    "Yobibytes (YiB)": 9671406556917033397649408,

    // Decimal bytes (8 x 10^n)
    "Kilobytes (KB)": 8e3,
    "Megabytes (MB)": 8e6,
    "Gigabytes (GB)": 8e9,
    "Terabytes (TB)": 8e12,
    "Petabytes (PB)": 8e15,
    "Exabytes (EB)": 8e18,
    "Zettabytes (ZB)": 8e21,
    "Yottabytes (YB)": 8e24
};

export default ConvertDataUnits;
