/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert mass operation
 */
class ConvertMass extends Operation {
    /**
     * ConvertMass constructor
     */
    constructor() {
        super();

        this.name = "Convert mass";
        this.module = "Default";
        this.description = "Converts a unit of mass to another format.";
        this.infoURL = "https://wikipedia.org/wiki/Orders_of_magnitude_(mass)";
        this.inputType = "BigNumber";
        this.outputType = "BigNumber";
        this.args = [
            {
                name: "Input units",
                type: "option",
                value: MASS_UNITS,
            },
            {
                name: "Output units",
                type: "option",
                value: MASS_UNITS,
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

        input = input.times(MASS_FACTOR[inputUnits]);
        return input.div(MASS_FACTOR[outputUnits]);
    }
}

const MASS_UNITS = [
    "[Metric]",
    "Yoctogram (yg)",
    "Zeptogram (zg)",
    "Attogram (ag)",
    "Femtogram (fg)",
    "Picogram (pg)",
    "Nanogram (ng)",
    "Microgram (μg)",
    "Milligram (mg)",
    "Centigram (cg)",
    "Decigram (dg)",
    "Gram (g)",
    "Decagram (dag)",
    "Hectogram (hg)",
    "Kilogram (kg)",
    "Megagram (Mg)",
    "Tonne (t)",
    "Gigagram (Gg)",
    "Teragram (Tg)",
    "Petagram (Pg)",
    "Exagram (Eg)",
    "Zettagram (Zg)",
    "Yottagram (Yg)",
    "[/Metric]",
    "[Imperial Avoirdupois]",
    "Grain (gr)",
    "Dram (dr)",
    "Ounce (oz)",
    "Pound (lb)",
    "Nail",
    "Stone (st)",
    "Quarter (gr)",
    "Tod",
    "US hundredweight (cwt)",
    "Imperial hundredweight (cwt)",
    "US ton (t)",
    "Imperial ton (t)",
    "[/Imperial Avoirdupois]",
    "[Imperial Troy]",
    "Grain (gr)",
    "Pennyweight (dwt)",
    "Troy dram (dr t)",
    "Troy ounce (oz t)",
    "Troy pound (lb t)",
    "Mark",
    "[/Imperial Troy]",
    "[Archaic]",
    "Wey",
    "Wool wey",
    "Suffolk wey",
    "Wool sack",
    "Coal sack",
    "Load",
    "Last",
    "Flax or feather last",
    "Gunpowder last",
    "Picul",
    "Rice last",
    "[/Archaic]",
    "[Comparisons]",
    "Big Ben (14 tonnes)",
    "Blue whale (180 tonnes)",
    "International Space Station (417 tonnes)",
    "Space Shuttle (2,041 tonnes)",
    "RMS Titanic (52,000 tonnes)",
    "Great Pyramid of Giza (6,000,000 tonnes)",
    "Earth's oceans (1.4 yottagrams)",
    "[/Comparisons]",
    "[Astronomical]",
    "A teaspoon of neutron star (5,500 million tonnes)",
    "Lunar mass (ML)",
    "Earth mass (M⊕)",
    "Jupiter mass (MJ)",
    "Solar mass (M☉)",
    "Sagittarius A* (7.5 x 10^36 kgs-ish)",
    "Milky Way galaxy (1.2 x 10^42 kgs)",
    "The observable universe (1.45 x 10^53 kgs)",
    "[/Astronomical]",
];

const MASS_FACTOR = {
    // Multiples of a gram
    // Metric
    "Yoctogram (yg)": 1e-24,
    "Zeptogram (zg)": 1e-21,
    "Attogram (ag)": 1e-18,
    "Femtogram (fg)": 1e-15,
    "Picogram (pg)": 1e-12,
    "Nanogram (ng)": 1e-9,
    "Microgram (μg)": 1e-6,
    "Milligram (mg)": 1e-3,
    "Centigram (cg)": 1e-2,
    "Decigram (dg)": 1e-1,
    "Gram (g)": 1,
    "Decagram (dag)": 10,
    "Hectogram (hg)": 100,
    "Kilogram (kg)": 1000,
    "Megagram (Mg)": 1e6,
    "Tonne (t)": 1e6,
    "Gigagram (Gg)": 1e9,
    "Teragram (Tg)": 1e12,
    "Petagram (Pg)": 1e15,
    "Exagram (Eg)": 1e18,
    "Zettagram (Zg)": 1e21,
    "Yottagram (Yg)": 1e24,

    // Imperial Avoirdupois
    "Grain (gr)": 64.79891e-3,
    "Dram (dr)": 1.7718451953125,
    "Ounce (oz)": 28.349523125,
    "Pound (lb)": 453.59237,
    Nail: 3175.14659,
    "Stone (st)": 6.35029318e3,
    "Quarter (gr)": 12700.58636,
    Tod: 12700.58636,
    "US hundredweight (cwt)": 45.359237e3,
    "Imperial hundredweight (cwt)": 50.80234544e3,
    "US ton (t)": 907.18474e3,
    "Imperial ton (t)": 1016.0469088e3,

    // Imperial Troy
    "Pennyweight (dwt)": 1.55517384,
    "Troy dram (dr t)": 3.8879346,
    "Troy ounce (oz t)": 31.1034768,
    "Troy pound (lb t)": 373.2417216,
    Mark: 248.8278144,

    // Archaic
    Wey: 76.5e3,
    "Wool wey": 101.7e3,
    "Suffolk wey": 161.5e3,
    "Wool sack": 153000,
    "Coal sack": 50.80234544e3,
    Load: 918000,
    Last: 1836000,
    "Flax or feather last": 770e3,
    "Gunpowder last": 1090e3,
    Picul: 60.478982e3,
    "Rice last": 1200e3,

    // Comparisons
    "Big Ben (14 tonnes)": 14e6,
    "Blue whale (180 tonnes)": 180e6,
    "International Space Station (417 tonnes)": 417e6,
    "Space Shuttle (2,041 tonnes)": 2041e6,
    "RMS Titanic (52,000 tonnes)": 52000e6,
    "Great Pyramid of Giza (6,000,000 tonnes)": 6e12,
    "Earth's oceans (1.4 yottagrams)": 1.4e24,

    // Astronomical
    "A teaspoon of neutron star (5,500 million tonnes)": 5.5e15,
    "Lunar mass (ML)": 7.342e25,
    "Earth mass (M⊕)": 5.97219e27,
    "Jupiter mass (MJ)": 1.8981411476999997e30,
    "Solar mass (M☉)": 1.98855e33,
    "Sagittarius A* (7.5 x 10^36 kgs-ish)": 7.5e39,
    "Milky Way galaxy (1.2 x 10^42 kgs)": 1.2e45,
    "The observable universe (1.45 x 10^53 kgs)": 1.45e56,
};

export default ConvertMass;
