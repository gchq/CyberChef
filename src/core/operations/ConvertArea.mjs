/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert area operation
 */
class ConvertArea extends Operation {
    /**
     * ConvertArea constructor
     */
    constructor() {
        super();

        this.name = "Convert area";
        this.module = "Default";
        this.description = "Converts a unit of area to another format.";
        this.infoURL = "https://wikipedia.org/wiki/Orders_of_magnitude_(area)";
        this.inputType = "BigNumber";
        this.outputType = "BigNumber";
        this.args = [
            {
                name: "Input units",
                type: "option",
                value: AREA_UNITS,
            },
            {
                name: "Output units",
                type: "option",
                value: AREA_UNITS,
            },
        ];
    }

    /**
     * @param {BigNumber} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const [inputUnits, outputUnits] = args;

        input = input.times(AREA_FACTOR[inputUnits]);
        return input.div(AREA_FACTOR[outputUnits]);
    }
}

const AREA_UNITS = [
    "[Metric]",
    "Square metre (sq m)",
    "Square kilometre (sq km)",
    "Centiare (ca)",
    "Deciare (da)",
    "Are (a)",
    "Decare (daa)",
    "Hectare (ha)",
    "[/Metric]",
    "[Imperial]",
    "Square inch (sq in)",
    "Square foot (sq ft)",
    "Square yard (sq yd)",
    "Square mile (sq mi)",
    "Perch (sq per)",
    "Rood (ro)",
    "International acre (ac)",
    "[/Imperial]",
    "[US customary units]",
    "US survey acre (ac)",
    "US survey square mile (sq mi)",
    "US survey township",
    "[/US customary units]",
    "[Nuclear physics]",
    "Yoctobarn (yb)",
    "Zeptobarn (zb)",
    "Attobarn (ab)",
    "Femtobarn (fb)",
    "Picobarn (pb)",
    "Nanobarn (nb)",
    "Microbarn (μb)",
    "Millibarn (mb)",
    "Barn (b)",
    "Kilobarn (kb)",
    "Megabarn (Mb)",
    "Outhouse",
    "Shed",
    "Planck area",
    "[/Nuclear physics]",
    "[Comparisons]",
    "Washington D.C.",
    "Isle of Wight",
    "Wales",
    "Texas",
    "[/Comparisons]",
];

const AREA_FACTOR = {
    // Multiples of a square metre
    // Metric
    "Square metre (sq m)": 1,
    "Square kilometre (sq km)": 1e6,

    "Centiare (ca)": 1,
    "Deciare (da)": 10,
    "Are (a)": 100,
    "Decare (daa)": 1e3,
    "Hectare (ha)": 1e4,

    // Imperial
    "Square inch (sq in)": 0.00064516,
    "Square foot (sq ft)": 0.09290304,
    "Square yard (sq yd)": 0.83612736,
    "Square mile (sq mi)": 2589988.110336,
    "Perch (sq per)": 42.21,
    "Rood (ro)": 1011,
    "International acre (ac)": 4046.8564224,

    // US customary units
    "US survey acre (ac)": 4046.87261,
    "US survey square mile (sq mi)": 2589998.470305239,
    "US survey township": 93239944.9309886,

    // Nuclear physics
    "Yoctobarn (yb)": 1e-52,
    "Zeptobarn (zb)": 1e-49,
    "Attobarn (ab)": 1e-46,
    "Femtobarn (fb)": 1e-43,
    "Picobarn (pb)": 1e-40,
    "Nanobarn (nb)": 1e-37,
    "Microbarn (μb)": 1e-34,
    "Millibarn (mb)": 1e-31,
    "Barn (b)": 1e-28,
    "Kilobarn (kb)": 1e-25,
    "Megabarn (Mb)": 1e-22,

    "Planck area": 2.6e-70,
    Shed: 1e-52,
    Outhouse: 1e-34,

    // Comparisons
    "Washington D.C.": 176119191.502848,
    "Isle of Wight": 380000000,
    Wales: 20779000000,
    Texas: 696241000000,
};

export default ConvertArea;
