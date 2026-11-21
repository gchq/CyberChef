/**
 * Escape Unicode Characters operation tests.
 *
 * @author Shakhtar-Sankur
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Escape Unicode Characters: \\u BMP",
        input: "σου",
        expectedOutput: "\\u03C3\\u03BF\\u03C5",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["\\u", false, 4, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: \\u keeps surrogate pairs",
        input: "\u{1F600}",
        expectedOutput: "\\uD83D\\uDE00",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["\\u", false, 4, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ astral plane as one code point",
        input: "\u{1F600}",
        expectedOutput: "U+1F600",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ escapes a hex digit after an escape",
        input: "\ne ß2 \u{1F600}1",
        expectedOutput: "U+000AU+0065 U+00DFU+0032 U+1F600U+0031",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ leaves other characters after an escape",
        input: "ég é-",
        expectedOutput: "U+00E9g U+00E9-",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ with 6-digit padding is not ambiguous",
        input: "ée",
        expectedOutput: "U+0000E9e",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 6, true],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ round trip",
        input: "\ne ß2 café 1€0 \u{1F600}b \u{1F468}‍\u{1F4BB} Ωa",
        expectedOutput: "\ne ß2 café 1€0 \u{1F600}b \u{1F468}‍\u{1F4BB} Ωa",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, true],
            },
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: U+ round trip, lowercase hex",
        input: "\nf ßa \u{1F600}c",
        expectedOutput: "\nf ßa \u{1F600}c",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, false],
            },
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
        ],
    },
    {
        name: "Escape Unicode Characters: \\u round trip",
        input: "\ne ß2 café \u{1F600}b",
        expectedOutput: "\ne ß2 café \u{1F600}b",
        recipeConfig: [
            {
                op: "Escape Unicode Characters",
                args: ["\\u", false, 4, true],
            },
            {
                op: "Unescape Unicode Characters",
                args: ["\\u"],
            },
        ],
    },
]);
