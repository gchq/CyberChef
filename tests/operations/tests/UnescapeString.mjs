/**
 * UnescapeString tests.
 *
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "UnescapeString: escape sequences",
        input: "\\a\\b\\f\\n\\r\\t\\v\\'\\\"",
        expectedOutput: String.fromCharCode(0x07, 0x08, 0x0c, 0x0a, 0x0d, 0x09,
            0x0b, 0x27, 0x22),
        recipeConfig: [
            {
                op: "Unescape string",
                args: [],
            },
        ],
    },
    {
        name: "UnescapeString: octals",
        input: "\\0\\01\\012\\1\\12",
        expectedOutput: String.fromCharCode(0, 1, 10, 1, 10),
        recipeConfig: [
            {
                op: "Unescape string",
                args: [],
            },
        ],
    },
    {
        name: "UnescapeString: hexadecimals",
        input: "\\x00\\xAA\\xaa",
        expectedOutput: String.fromCharCode(0, 170, 170),
        recipeConfig: [
            {
                op: "Unescape string",
                args: [],
            },
        ],
    },
    {
        name: "UnescapeString: unicode",
        input: "\\u0061\\u{0062}",
        expectedOutput: "ab",
        recipeConfig: [
            {
                op: "Unescape string",
                args: [],
            },
        ],
    },
]);
