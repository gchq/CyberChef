/**
 * Tests for arithmetical operations
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Subtract",
        input: "321,123,test",
        expectedOutput: "198",
        recipeConfig: [
            {
                "op": "Subtract",
                "args": ["Comma"]
            },
        ],
    },
    {
        name: "Subtract - no valid input",
        input: "test",
        expectedOutput: "NaN",
        recipeConfig: [
            {
                "op": "Subtract",
                "args": ["Comma"]
            },
        ],
    },
]);
