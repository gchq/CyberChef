/**
 * @author bartblaze []
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Convert to Leet Speak: basic text",
        input: "leet",
        expectedOutput: "l337",
        recipeConfig: [
            {
                op: "Convert Leet Speak",
                args: ["To Leet Speak"]
            }
        ]
    },
    {
        name: "Convert from Leet Speak: basic leet",
        input: "l337",
        expectedOutput: "leet",
        recipeConfig: [
            {
                op: "Convert Leet Speak",
                args: ["From Leet Speak"]
            }
        ]
    }
]);

