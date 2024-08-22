/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // Add tests specific to the Wrap operation
    {
        name: "Wrap text at 64 characters",
        input: "A".repeat(128),  // Generate an input string of 128 'A' characters
        expectedOutput: "A".repeat(64) + "\n" + "A".repeat(64),  // Expected output with a line break after 64 characters
        recipeConfig: [
            {
                "op": "Wrap",
                "args": [64]
            },
        ],
    },
    {
        name: "Wrap text at 32 characters",
        input: "B".repeat(96),  // Generate an input string of 96 'B' characters
        expectedOutput: "B".repeat(32) + "\n" + "B".repeat(32) + "\n" + "B".repeat(32),  // Expected output with line breaks after every 32 characters
        recipeConfig: [
            {
                "op": "Wrap",
                "args": [32]
            },
        ],
    },
    {
        name: "Wrap text at 10 characters",
        input: "1234567890".repeat(10),  // Generate an input string by repeating '1234567890'
        expectedOutput: Array(10).fill("1234567890").join("\n"),  // Expected output with line breaks every 10 characters
        recipeConfig: [
            {
                "op": "Wrap",
                "args": [10]
            },
        ],
    }
]);