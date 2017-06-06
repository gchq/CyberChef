/**
 * Unit conversion operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Convert = {

    /**
     * @constant
     * @default
     */
    DISTANCE_UNITS: [
        "[Metric]", "Nanometres (nm)", "Micrometres (µm)", "Millimetres (mm)", "Centimetres (cm)", "Metres (m)", "Kilometers (km)", "[/Metric]",
        "[Imperial]", "Thou (th)", "Inches (in)", "Feet (ft)", "Yards (yd)", "Chains (ch)", "Furlongs (fur)", "Miles (mi)", "Leagues (lea)", "[/Imperial]",
        "[Maritime]", "Fathoms (ftm)", "Cables", "Nautical miles", "[/Maritime]",
        "[Comparisons]", "Cars (4m)", "Buses (8.4m)", "American football fields (91m)", "Football pitches (105m)", "[/Comparisons]",
        "[Astronomical]", "Earth-to-Moons", "Earth's equators", "Astronomical units (au)", "Light-years (ly)", "Parsecs (pc)", "[/Astronomical]",
    ],
    /**
     * @constant
     * @default
     */
    DISTANCE_FACTOR: { // Multiples of a metre
        "Nanometres (nm)"   : 1e-9,
        "Micrometres (µm)"  : 1e-6,
        "Millimetres (mm)"  : 1e-3,
        "Centimetres (cm)"  : 1e-2,
        "Metres (m)"        : 1,
        "Kilometers (km)"   : 1e3,

        "Thou (th)"         : 0.0000254,
        "Inches (in)"       : 0.0254,
        "Feet (ft)"         : 0.3048,
        "Yards (yd)"        : 0.9144,
        "Chains (ch)"       : 20.1168,
        "Furlongs (fur)"    : 201.168,
        "Miles (mi)"        : 1609.344,
        "Leagues (lea)"     : 4828.032,

        "Fathoms (ftm)"     : 1.853184,
        "Cables"            : 185.3184,
        "Nautical miles"    : 1853.184,

        "Cars (4m)"         : 4,
        "Buses (8.4m)"      : 8.4,
        "American football fields (91m)": 91,
        "Football pitches (105m)": 105,

        "Earth-to-Moons"    : 380000000,
        "Earth's equators"  : 40075016.686,
        "Astronomical units (au)": 149597870700,
        "Light-years (ly)"  : 9460730472580800,
        "Parsecs (pc)"      : 3.0856776e16
    },

    /**
     * Convert distance operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {number}
     */
    runDistance: function (input, args) {
        let inputUnits = args[0],
            outputUnits = args[1];

        input = input * Convert.DISTANCE_FACTOR[inputUnits];
        return input / Convert.DISTANCE_FACTOR[outputUnits];
        // TODO Remove rounding errors (e.g. 1.000000000001)
    },


    /**
     * @constant
     * @default
     */
    DATA_UNITS: [
        "Bits (b)", "Nibbles", "Octets", "Bytes (B)",
        "[Binary bits (2^n)]", "Kibibits (Kib)", "Mebibits (Mib)", "Gibibits (Gib)", "Tebibits (Tib)", "Pebibits (Pib)", "Exbibits (Eib)", "Zebibits (Zib)", "Yobibits (Yib)", "[/Binary bits (2^n)]",
        "[Decimal bits (10^n)]", "Decabits", "Hectobits", "Kilobits (kb)", "Megabits (Mb)", "Gigabits (Gb)", "Terabits (Tb)", "Petabits (Pb)", "Exabits (Eb)", "Zettabits (Zb)", "Yottabits (Yb)", "[/Decimal bits (10^n)]",
        "[Binary bytes (8 x 2^n)]", "Kibibytes (KiB)", "Mebibytes (MiB)", "Gibibytes (GiB)", "Tebibytes (TiB)", "Pebibytes (PiB)", "Exbibytes (EiB)", "Zebibytes (ZiB)", "Yobibytes (YiB)", "[/Binary bytes (8 x 2^n)]",
        "[Decimal bytes (8 x 10^n)]", "Kilobytes (KB)", "Megabytes (MB)", "Gigabytes (GB)", "Terabytes (TB)", "Petabytes (PB)", "Exabytes (EB)", "Zettabytes (ZB)", "Yottabytes (YB)", "[/Decimal bytes (8 x 10^n)]"
    ],
    /**
     * @constant
     * @default
     */
    DATA_FACTOR: { // Multiples of a bit
        "Bits (b)"        : 1,
        "Nibbles"         : 4,
        "Octets"          : 8,
        "Bytes (B)"       : 8,

        // Binary bits (2^n)
        "Kibibits (Kib)"  : 1024,
        "Mebibits (Mib)"  : 1048576,
        "Gibibits (Gib)"  : 1073741824,
        "Tebibits (Tib)"  : 1099511627776,
        "Pebibits (Pib)"  : 1125899906842624,
        "Exbibits (Eib)"  : 1152921504606846976,
        "Zebibits (Zib)"  : 1180591620717411303424,
        "Yobibits (Yib)"  : 1208925819614629174706176,

        // Decimal bits (10^n)
        "Decabits"        : 10,
        "Hectobits"       : 100,
        "Kilobits (Kb)"   : 1e3,
        "Megabits (Mb)"   : 1e6,
        "Gigabits (Gb)"   : 1e9,
        "Terabits (Tb)"   : 1e12,
        "Petabits (Pb)"   : 1e15,
        "Exabits (Eb)"    : 1e18,
        "Zettabits (Zb)"  : 1e21,
        "Yottabits (Yb)"  : 1e24,

        // Binary bytes (8 x 2^n)
        "Kibibytes (KiB)" : 8192,
        "Mebibytes (MiB)" : 8388608,
        "Gibibytes (GiB)" : 8589934592,
        "Tebibytes (TiB)" : 8796093022208,
        "Pebibytes (PiB)" : 9007199254740992,
        "Exbibytes (EiB)" : 9223372036854775808,
        "Zebibytes (ZiB)" : 9444732965739290427392,
        "Yobibytes (YiB)" : 9671406556917033397649408,

        // Decimal bytes (8 x 10^n)
        "Kilobytes (KB)"  : 8e3,
        "Megabytes (MB)"  : 8e6,
        "Gigabytes (GB)"  : 8e9,
        "Terabytes (TB)"  : 8e12,
        "Petabytes (PB)"  : 8e15,
        "Exabytes (EB)"   : 8e18,
        "Zettabytes (ZB)" : 8e21,
        "Yottabytes (YB)" : 8e24,
    },

    /**
     * Convert data units operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {number}
     */
    runDataSize: function (input, args) {
        let inputUnits = args[0],
            outputUnits = args[1];

        input = input * Convert.DATA_FACTOR[inputUnits];
        return input / Convert.DATA_FACTOR[outputUnits];
    },


    /**
     * @constant
     * @default
     */
    AREA_UNITS: [
        "[Metric]", "Square metre (sq m)", "Square kilometre (sq km)", "Centiare (ca)", "Deciare (da)", "Are (a)", "Decare (daa)", "Hectare (ha)", "[/Metric]",
        "[Imperial]", "Square inch (sq in)", "Square foot (sq ft)", "Square yard (sq yd)", "Square mile (sq mi)", "Perch (sq per)", "Rood (ro)", "International acre (ac)", "[/Imperial]",
        "[US customary units]", "US survey acre (ac)", "US survey square mile (sq mi)", "US survey township", "[/US customary units]",
        "[Nuclear physics]", "Yoctobarn (yb)", "Zeptobarn (zb)", "Attobarn (ab)", "Femtobarn (fb)", "Picobarn (pb)", "Nanobarn (nb)", "Microbarn (μb)", "Millibarn (mb)", "Barn (b)", "Kilobarn (kb)", "Megabarn (Mb)", "Outhouse", "Shed", "Planck area", "[/Nuclear physics]",
        "[Comparisons]", "Washington D.C.", "Isle of Wight", "Wales", "Texas", "[/Comparisons]",
    ],
    /**
     * @constant
     * @default
     */
    AREA_FACTOR: { // Multiples of a square metre
        // Metric
        "Square metre (sq m)"       : 1,
        "Square kilometre (sq km)"  : 1e6,

        "Centiare (ca)"             : 1,
        "Deciare (da)"              : 10,
        "Are (a)"                   : 100,
        "Decare (daa)"              : 1e3,
        "Hectare (ha)"              : 1e4,

        // Imperial
        "Square inch (sq in)"       : 0.00064516,
        "Square foot (sq ft)"       : 0.09290304,
        "Square yard (sq yd)"       : 0.83612736,
        "Square mile (sq mi)"       : 2589988.110336,
        "Perch (sq per)"            : 42.21,
        "Rood (ro)"                 : 1011,
        "International acre (ac)"   : 4046.8564224,

        // US customary units
        "US survey acre (ac)"       : 4046.87261,
        "US survey square mile (sq mi)" : 2589998.470305239,
        "US survey township"        : 93239944.9309886,

        // Nuclear physics
        "Yoctobarn (yb)"            : 1e-52,
        "Zeptobarn (zb)"            : 1e-49,
        "Attobarn (ab)"             : 1e-46,
        "Femtobarn (fb)"            : 1e-43,
        "Picobarn (pb)"             : 1e-40,
        "Nanobarn (nb)"             : 1e-37,
        "Microbarn (μb)"            : 1e-34,
        "Millibarn (mb)"            : 1e-31,
        "Barn (b)"                  : 1e-28,
        "Kilobarn (kb)"             : 1e-25,
        "Megabarn (Mb)"             : 1e-22,

        "Planck area"               : 2.6e-70,
        "Shed"                      : 1e-52,
        "Outhouse"                  : 1e-34,

        // Comparisons
        "Washington D.C."           : 176119191.502848,
        "Isle of Wight"             : 380000000,
        "Wales"                     : 20779000000,
        "Texas"                     : 696241000000,
    },

    /**
     * Convert area operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {number}
     */
    runArea: function (input, args) {
        let inputUnits = args[0],
            outputUnits = args[1];

        input = input * Convert.AREA_FACTOR[inputUnits];
        return input / Convert.AREA_FACTOR[outputUnits];
    },


    /**
     * @constant
     * @default
     */
    MASS_UNITS: [
        "[Metric]", "Yoctogram (yg)", "Zeptogram (zg)", "Attogram (ag)", "Femtogram (fg)", "Picogram (pg)", "Nanogram (ng)", "Microgram (μg)", "Milligram (mg)", "Centigram (cg)", "Decigram (dg)", "Gram (g)", "Decagram (dag)", "Hectogram (hg)", "Kilogram (kg)", "Megagram (Mg)", "Tonne (t)", "Gigagram (Gg)", "Teragram (Tg)", "Petagram (Pg)", "Exagram (Eg)", "Zettagram (Zg)", "Yottagram (Yg)", "[/Metric]",
        "[Imperial Avoirdupois]", "Grain (gr)", "Dram (dr)", "Ounce (oz)", "Pound (lb)", "Nail", "Stone (st)", "Quarter (gr)", "Tod", "US hundredweight (cwt)", "Imperial hundredweight (cwt)", "US ton (t)", "Imperial ton (t)", "[/Imperial Avoirdupois]",
        "[Imperial Troy]", "Grain (gr)", "Pennyweight (dwt)", "Troy dram (dr t)", "Troy ounce (oz t)", "Troy pound (lb t)", "Mark", "[/Imperial Troy]",
        "[Archaic]", "Wey", "Wool wey", "Suffolk wey", "Wool sack", "Coal sack", "Load", "Last", "Flax or feather last", "Gunpowder last", "Picul", "Rice last", "[/Archaic]",
        "[Comparisons]", "Big Ben (14 tonnes)", "Blue whale (180 tonnes)", "International Space Station (417 tonnes)", "Space Shuttle (2,041 tonnes)", "RMS Titanic (52,000 tonnes)", "Great Pyramid of Giza (6,000,000 tonnes)", "Earth's oceans (1.4 yottagrams)", "[/Comparisons]",
        "[Astronomical]", "A teaspoon of neutron star (5,500 million tonnes)", "Lunar mass (ML)", "Earth mass (M⊕)", "Jupiter mass (MJ)", "Solar mass (M☉)", "Sagittarius A* (7.5 x 10^36 kgs-ish)", "Milky Way galaxy (1.2 x 10^42 kgs)", "The observable universe (1.45 x 10^53 kgs)", "[/Astronomical]",
    ],
    /**
     * @constant
     * @default
     */
    MASS_FACTOR: { // Multiples of a gram
        // Metric
        "Yoctogram (yg)"    : 1e-24,
        "Zeptogram (zg)"    : 1e-21,
        "Attogram (ag)"     : 1e-18,
        "Femtogram (fg)"    : 1e-15,
        "Picogram (pg)"     : 1e-12,
        "Nanogram (ng)"     : 1e-9,
        "Microgram (μg)"    : 1e-6,
        "Milligram (mg)"    : 1e-3,
        "Centigram (cg)"    : 1e-2,
        "Decigram (dg)"     : 1e-1,
        "Gram (g)"          : 1,
        "Decagram (dag)"    : 10,
        "Hectogram (hg)"    : 100,
        "Kilogram (kg)"     : 1000,
        "Megagram (Mg)"     : 1e6,
        "Tonne (t)"         : 1e6,
        "Gigagram (Gg)"     : 1e9,
        "Teragram (Tg)"     : 1e12,
        "Petagram (Pg)"     : 1e15,
        "Exagram (Eg)"      : 1e18,
        "Zettagram (Zg)"    : 1e21,
        "Yottagram (Yg)"    : 1e24,

        // Imperial Avoirdupois
        "Grain (gr)"        : 64.79891e-3,
        "Dram (dr)"         : 1.7718451953125,
        "Ounce (oz)"        : 28.349523125,
        "Pound (lb)"        : 453.59237,
        "Nail"              : 3175.14659,
        "Stone (st)"        : 6.35029318e3,
        "Quarter (gr)"      : 12700.58636,
        "Tod"               : 12700.58636,
        "US hundredweight (cwt)" : 45.359237e3,
        "Imperial hundredweight (cwt)" : 50.80234544e3,
        "US ton (t)"        : 907.18474e3,
        "Imperial ton (t)"  : 1016.0469088e3,

        // Imperial Troy
        "Pennyweight (dwt)" : 1.55517384,
        "Troy dram (dr t)"  : 3.8879346,
        "Troy ounce (oz t)" : 31.1034768,
        "Troy pound (lb t)" : 373.2417216,
        "Mark"              : 248.8278144,

        // Archaic
        "Wey"               : 76.5e3,
        "Wool wey"          : 101.7e3,
        "Suffolk wey"       : 161.5e3,
        "Wool sack"         : 153000,
        "Coal sack"         : 50.80234544e3,
        "Load"              : 918000,
        "Last"              : 1836000,
        "Flax or feather last" : 770e3,
        "Gunpowder last"    : 1090e3,
        "Picul"             : 60.478982e3,
        "Rice last"         : 1200e3,

        // Comparisons
        "Big Ben (14 tonnes)"                      : 14e6,
        "Blue whale (180 tonnes)"                  : 180e6,
        "International Space Station (417 tonnes)" : 417e6,
        "Space Shuttle (2,041 tonnes)"             : 2041e6,
        "RMS Titanic (52,000 tonnes)"              : 52000e6,
        "Great Pyramid of Giza (6,000,000 tonnes)" : 6e12,
        "Earth's oceans (1.4 yottagrams)"          : 1.4e24,

        // Astronomical
        "A teaspoon of neutron star (5,500 million tonnes)" : 5.5e15,
        "Lunar mass (ML)"                          : 7.342e25,
        "Earth mass (M⊕)"                          : 5.97219e27,
        "Jupiter mass (MJ)"                        : 1.8981411476999997e30,
        "Solar mass (M☉)"                         : 1.98855e33,
        "Sagittarius A* (7.5 x 10^36 kgs-ish)"     : 7.5e39,
        "Milky Way galaxy (1.2 x 10^42 kgs)"       : 1.2e45,
        "The observable universe (1.45 x 10^53 kgs)" : 1.45e56,
    },

    /**
     * Convert mass operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {number}
     */
    runMass: function (input, args) {
        let inputUnits = args[0],
            outputUnits = args[1];

        input = input * Convert.MASS_FACTOR[inputUnits];
        return input / Convert.MASS_FACTOR[outputUnits];
    },


    /**
     * @constant
     * @default
     */
    SPEED_UNITS: [
        "[Metric]", "Metres per second (m/s)", "Kilometres per hour (km/h)", "[/Metric]",
        "[Imperial]", "Miles per hour (mph)", "Knots (kn)", "[/Imperial]",
        "[Comparisons]", "Human hair growth rate", "Bamboo growth rate", "World's fastest snail", "Usain Bolt's top speed", "Jet airliner cruising speed", "Concorde", "SR-71 Blackbird", "Space Shuttle", "International Space Station", "[/Comparisons]",
        "[Scientific]", "Sound in standard atmosphere", "Sound in water", "Lunar escape velocity", "Earth escape velocity", "Earth's solar orbit", "Solar system's Milky Way orbit", "Milky Way relative to the cosmic microwave background", "Solar escape velocity", "Neutron star escape velocity (0.3c)", "Light in a diamond (0.4136c)", "Signal in an optical fibre (0.667c)", "Light (c)", "[/Scientific]",
    ],
    /**
     * @constant
     * @default
     */
    SPEED_FACTOR: { // Multiples of m/s
        // Metric
        "Metres per second (m/s)"        : 1,
        "Kilometres per hour (km/h)"     : 0.2778,

        // Imperial
        "Miles per hour (mph)"           : 0.44704,
        "Knots (kn)"                     : 0.5144,

        // Comparisons
        "Human hair growth rate"         : 4.8e-9,
        "Bamboo growth rate"             : 1.4e-5,
        "World's fastest snail"          : 0.00275,
        "Usain Bolt's top speed"         : 12.42,
        "Jet airliner cruising speed"    : 250,
        "Concorde"                       : 603,
        "SR-71 Blackbird"                : 981,
        "Space Shuttle"                  : 1400,
        "International Space Station"    : 7700,

        // Scientific
        "Sound in standard atmosphere"   : 340.3,
        "Sound in water"                 : 1500,
        "Lunar escape velocity"          : 2375,
        "Earth escape velocity"          : 11200,
        "Earth's solar orbit"            : 29800,
        "Solar system's Milky Way orbit" : 200000,
        "Milky Way relative to the cosmic microwave background" : 552000,
        "Solar escape velocity"          : 617700,
        "Neutron star escape velocity (0.3c)" : 100000000,
        "Light in a diamond (0.4136c)"   : 124000000,
        "Signal in an optical fibre (0.667c)" : 200000000,
        "Light (c)"                      : 299792458,
    },

    /**
     * Convert speed operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {number}
     */
    runSpeed: function (input, args) {
        let inputUnits = args[0],
            outputUnits = args[1];

        input = input * Convert.SPEED_FACTOR[inputUnits];
        return input / Convert.SPEED_FACTOR[outputUnits];
    },

};

export default Convert;
