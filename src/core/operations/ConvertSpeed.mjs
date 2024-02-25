/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert speed operation
 */
class ConvertSpeed extends Operation {
    /**
     * ConvertSpeed constructor
     */
    constructor() {
        super();

        this.name = "Convert speed";
        this.module = "Default";
        this.description = "Converts a unit of speed to another format.";
        this.infoURL = "https://wikipedia.org/wiki/Orders_of_magnitude_(speed)";
        this.inputType = "BigNumber";
        this.outputType = "BigNumber";
        this.args = [
            {
                name: "Input units",
                type: "option",
                value: SPEED_UNITS,
            },
            {
                name: "Output units",
                type: "option",
                value: SPEED_UNITS,
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

        input = input.times(SPEED_FACTOR[inputUnits]);
        return input.div(SPEED_FACTOR[outputUnits]);
    }
}

const SPEED_UNITS = [
    "[Metric]",
    "Metres per second (m/s)",
    "Kilometres per hour (km/h)",
    "[/Metric]",
    "[Imperial]",
    "Miles per hour (mph)",
    "Knots (kn)",
    "[/Imperial]",
    "[Comparisons]",
    "Human hair growth rate",
    "Bamboo growth rate",
    "World's fastest snail",
    "Usain Bolt's top speed",
    "Jet airliner cruising speed",
    "Concorde",
    "SR-71 Blackbird",
    "Space Shuttle",
    "International Space Station",
    "[/Comparisons]",
    "[Scientific]",
    "Sound in standard atmosphere",
    "Sound in water",
    "Lunar escape velocity",
    "Earth escape velocity",
    "Earth's solar orbit",
    "Solar system's Milky Way orbit",
    "Milky Way relative to the cosmic microwave background",
    "Solar escape velocity",
    "Neutron star escape velocity (0.3c)",
    "Light in a diamond (0.4136c)",
    "Signal in an optical fibre (0.667c)",
    "Light (c)",
    "[/Scientific]",
];

const SPEED_FACTOR = {
    // Multiples of m/s
    // Metric
    "Metres per second (m/s)": 1,
    "Kilometres per hour (km/h)": 0.2778,

    // Imperial
    "Miles per hour (mph)": 0.44704,
    "Knots (kn)": 0.5144,

    // Comparisons
    "Human hair growth rate": 4.8e-9,
    "Bamboo growth rate": 1.4e-5,
    "World's fastest snail": 0.00275,
    "Usain Bolt's top speed": 12.42,
    "Jet airliner cruising speed": 250,
    Concorde: 603,
    "SR-71 Blackbird": 981,
    "Space Shuttle": 1400,
    "International Space Station": 7700,

    // Scientific
    "Sound in standard atmosphere": 340.3,
    "Sound in water": 1500,
    "Lunar escape velocity": 2375,
    "Earth escape velocity": 11200,
    "Earth's solar orbit": 29800,
    "Solar system's Milky Way orbit": 200000,
    "Milky Way relative to the cosmic microwave background": 552000,
    "Solar escape velocity": 617700,
    "Neutron star escape velocity (0.3c)": 100000000,
    "Light in a diamond (0.4136c)": 124000000,
    "Signal in an optical fibre (0.667c)": 200000000,
    "Light (c)": 299792458,
};

export default ConvertSpeed;
