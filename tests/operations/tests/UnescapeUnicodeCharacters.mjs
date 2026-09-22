/**
 * Unescape Unicode Characters operation tests.
 *
 * @author williballenthin
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Unescape Unicode Characters: \\u 4-digit BMP",
        input: "\\u03c3\\u03bf\\u03c5",
        expectedOutput: "σου",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["\\u"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: %u 4-digit BMP",
        input: "%u03c3%u03bf%u03c5",
        expectedOutput: "σου",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["%u"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: U+ 4-digit BMP",
        input: "U+0041",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: U+ 5-digit astral plane emoji",
        input: "U+1F600",
        expectedOutput: "\u{1F600}",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: U+ 6-digit zero-padded",
        input: "U+000041",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: U+ mixed lengths",
        input: "U+0041 U+1F600 U+000042",
        expectedOutput: "A \u{1F600} B",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Unescape Unicode Characters: passthrough with no matches",
        input: "hello world",
        expectedOutput: "hello world",
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["\\u"],
            },
        ],
    },
]);
