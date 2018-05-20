/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Convert distance operation
 */
class ConvertDistance extends Operation {

    /**
     * ConvertDistance constructor
     */
    constructor() {
        super();

        this.name = "Convert distance";
        this.module = "Default";
        this.description = "Converts a unit of distance to another format.";
        this.inputType = "BigNumber";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Input units",
                "type": "option",
                "value": DISTANCE_UNITS
            },
            {
                "name": "Output units",
                "type": "option",
                "value": DISTANCE_UNITS
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

        input = input.times(DISTANCE_FACTOR[inputUnits]);
        return input.div(DISTANCE_FACTOR[outputUnits]);
    }

}

const DISTANCE_UNITS = [
    "[Metric]", "Nanometres (nm)", "Micrometres (µm)", "Millimetres (mm)", "Centimetres (cm)", "Metres (m)", "Kilometers (km)", "[/Metric]",
    "[Imperial]", "Thou (th)", "Inches (in)", "Feet (ft)", "Yards (yd)", "Chains (ch)", "Furlongs (fur)", "Miles (mi)", "Leagues (lea)", "[/Imperial]",
    "[Maritime]", "Fathoms (ftm)", "Cables", "Nautical miles", "[/Maritime]",
    "[Comparisons]", "Cars (4m)", "Buses (8.4m)", "American football fields (91m)", "Football pitches (105m)", "[/Comparisons]",
    "[Astronomical]", "Earth-to-Moons", "Earth's equators", "Astronomical units (au)", "Light-years (ly)", "Parsecs (pc)", "[/Astronomical]",
];

const DISTANCE_FACTOR = { // Multiples of a metre
    "Nanometres (nm)":         1e-9,
    "Micrometres (µm)":        1e-6,
    "Millimetres (mm)":        1e-3,
    "Centimetres (cm)":        1e-2,
    "Metres (m)":              1,
    "Kilometers (km)":         1e3,

    "Thou (th)":               0.0000254,
    "Inches (in)":             0.0254,
    "Feet (ft)":               0.3048,
    "Yards (yd)":              0.9144,
    "Chains (ch)":             20.1168,
    "Furlongs (fur)":          201.168,
    "Miles (mi)":              1609.344,
    "Leagues (lea)":           4828.032,

    "Fathoms (ftm)":           1.853184,
    "Cables":                  185.3184,
    "Nautical miles":          1853.184,

    "Cars (4m)":               4,
    "Buses (8.4m)":            8.4,
    "American football fields (91m)": 91,
    "Football pitches (105m)": 105,

    "Earth-to-Moons":          380000000,
    "Earth's equators":        40075016.686,
    "Astronomical units (au)": 149597870700,
    "Light-years (ly)":        9460730472580800,
    "Parsecs (pc)":            3.0856776e16
};


export default ConvertDistance;
