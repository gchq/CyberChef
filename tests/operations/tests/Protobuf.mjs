/**
 * Protobuf tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Protobuf Decode",
        input: "0d1c0000001203596f751a024d65202b2a0a0a066162633132331200",
        expectedOutput: JSON.stringify({
            "1": 469762048,
            "2": "You",
            "3": "Me",
            "4": 43,
            "5": {
                "1": "abc123",
                "2": {}
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": []
            }
        ]
    },
]);
