/**
 * Convert co-ordinate format tests
 *
 * @author j433866
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

/**
 * TEST CO-ORDINATES
 * DD: 51.504°,-0.126°,
 * DDM: 51° 30.24',-0° 7.56',
 * DMS: 51° 30' 14.4",-0° 7' 33.6",
 * Geohash: gcpvj0h0x,
 * MGRS: 30U XC 99455 09790,
 * OSNG: TQ 30163 80005,
 * UTM: 30N 699456 5709791,
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Co-ordinates: From Decimal Degrees to Degrees Minutes Seconds",
        input: "51.504°,-0.126°,",
        expectedOutput: "51° 30' 14.4\",-0° 7' 33.6\",",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Degrees Minutes Seconds", "Comma", "None", 1]
            },
        ],
    },
    {
        name: "Co-ordinates: From Degrees Minutes Seconds to Decimal Degrees",
        input: "51° 30' 14.4\",-0° 7' 33.6\",",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Degrees Minutes Seconds", "Comma", "Decimal Degrees", "Comma", "None", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: From Decimal Degrees to Degrees Decimal Minutes",
        input: "51.504°,-0.126°,",
        expectedOutput: "51° 30.24',-0° 7.56',",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Degrees Decimal Minutes", "Comma", "None", 2]
            }
        ]
    },
    {
        name: "Co-ordinates: From Degrees Decimal Minutes to Decimal Degrees",
        input: "51° 30.24',-0° 7.56',",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Degrees Decimal Minutes", "Comma", "Decimal Degrees", "Comma", "None", 3]
            }
        ]
    },
    {
        name: "Co-ordinates: From Decimal Degrees to Decimal Degrees",
        input: "51.504°,-0.126°,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Decimal Degrees", "Comma", "None", 3]
            }
        ]
    },
    {
        name: "Co-ordinates: From Decimal Degrees to Geohash",
        input: "51.504°,-0.126°,",
        expectedOutput: "gcpvj0h0x,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Geohash", "Comma", "None", 9]
            },
        ],
    },
    {
        name: "Co-ordinates: From Geohash to Decimal Degrees",
        input: "gcpvj0h0x,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Geohash", "Comma", "Decimal Degrees", "Comma", "None", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: From Decimal Degrees to MGRS",
        input: "51.504°,-0.126°,",
        expectedOutput: "30U XC 99455 09790,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Military Grid Reference System", "Comma", "None", 10]
            },
        ],
    },
    {
        name: "Co-ordinates: From MGRS to Decimal Degrees",
        input: "30U XC 99455 09790,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Military Grid Reference System", "Comma", "Decimal Degrees", "Comma", "None", 3]
            }
        ]
    },
    {
        name: "Co-ordinates: From Decimal Degrees to OSNG",
        input: "51.504°,-0.126°,",
        expectedOutput: "TQ 30163 80005,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Ordnance Survey National Grid", "Comma", "None", 10]
            },
        ],
    },
    {
        name: "Co-ordinates: From OSNG to Decimal Degrees",
        input: "TQ 30163 80005,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Ordnance Survey National Grid", "Comma", "Decimal Degrees", "Comma", "None", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: From Decimal Degrees to UTM",
        input: "51.504°,-0.126°,",
        expectedOutput: "30 N 699456 5709791,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Universal Transverse Mercator", "Comma", "None", 0]
            },
        ],
    },
    {
        name: "Co-ordinates: From UTM to Decimal Degrees",
        input: "30 N 699456 5709791,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Universal Transverse Mercator", "Comma", "Decimal Degrees", "Comma", "None", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: Directions in input, not output",
        input: "N51.504°,W0.126°,",
        expectedOutput: "51.504°,-0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Decimal Degrees", "Comma", "None", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: Directions in input and output",
        input: "N51.504°,W0.126°,",
        expectedOutput: "N 51.504°,W 0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Decimal Degrees", "Comma", "Before", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: Directions not in input, in output",
        input: "51.504°,-0.126°,",
        expectedOutput: "N 51.504°,W 0.126°,",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Decimal Degrees", "Comma", "Before", 3]
            },
        ],
    },
    {
        name: "Co-ordinates: Directions not in input, in converted output",
        input: "51.504°,-0.126°,",
        expectedOutput: "N 51° 30' 14.4\",W 0° 7' 33.6\",",
        recipeConfig: [
            {
                op: "Convert co-ordinate format",
                args: ["Decimal Degrees", "Comma", "Degrees Minutes Seconds", "Comma", "Before", 3]
            },
        ],
    }
]);
