/**
* FromIntelHex tests
*
* @author bueddl [mail@bueddl.de]
* @copyright Crown Copyright 2026
* @license Apache-2.0
*/

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From Intel Hex: test",
        input: "Example input",
        expectedOutput: "Expected output",
        recipeConfig: [
            {
                op: "From Intel Hex",
                args: [],
            },
        ],
    },
]);
