/**
 * Pad Lines tests.
 *
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Can pad Lines adds the specified number of characters to the start.",
        input: "ABCD\nEF",
        expectedOutput: `--ABCD\n--EF`,
        recipeConfig: [
            {
                op: "Pad Lines",
                args: ["Start", 2, "-", "Fixed Count"], // [Position, Length, Character, Mode]
            },
        ],
    },
    {
        name: "Can pad lines adds the specified number of characters to the start.",
        input: "ABCD\nEF",
        expectedOutput: `--ABCD\n--EF`,
        recipeConfig: [
            {
                op: "Pad Lines",
                args: ["Start", 2, "-", "Fixed Count"], // [Position, Length, Character, Mode]
            },
        ],
    },
    {
        name: "Can pad lines adds the specified number of characters to the end.",
        input: "ABCD\nEF",
        expectedOutput: `ABCD--\nEF--`,
        recipeConfig: [
            {
                op: "Pad Lines",
                args: ["End", 2, "-", "Fixed Count"], // [Position, Length, Character, Mode]
            },
        ],
    },
    {
        name: "Can pad lines with enough characters to the start in target length mode.",
        input: "ABCD\nEF",
        expectedOutput: `------ABCD\n--------EF`,
        recipeConfig: [
            {
                op: "Pad Lines",
                args: ["Start", 10, "-", "Target Length"], // [Position, Length, Character, Mode]
            },
        ],
    },
    {
        name: "Can pad lines with enough characters to the end in target length mode.",
        input: "ABCD\nEF",
        expectedOutput: `ABCD------\nEF--------`,
        recipeConfig: [
            {
                op: "Pad Lines",
                args: ["End", 10, "-", "Target Length"], // [Position, Length, Character, Mode]
            },
        ],
    },
]);
