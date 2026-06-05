/**
 * Base conversion tests
 *
 * @author marko1olo
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Base: base 2",
        input: "63",
        expectedOutput: "111111",
        recipeConfig: [
            {
                "op": "To Base",
                "args": [2]
            }
        ]
    },
    {
        name: "To Base: fractional radix",
        input: "63",
        expectedOutput: "Error: Radix argument must be between 2 and 36",
        recipeConfig: [
            {
                "op": "To Base",
                "args": [2.2]
            }
        ]
    },
]);
