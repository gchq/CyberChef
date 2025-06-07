/**
 * @author ThomasNotTom
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        // Check line remains unbroken
        name: "Line Break: No break",
        input: "Hello, world!",
        expectedOutput: "Hello, world!",
        recipeConfig: [
            {
                "op": "Line Break",
                "args": [32, false]
            }
        ]
    }, {
        // Check line breaks
        name: "Line Break: With break",
        input: "Hello, world!",
        expectedOutput: "Hello,\n world\n!",
        recipeConfig: [
            {
                "op": "Line Break",
                "args": [6, false]
            }
        ]
    }
]);
