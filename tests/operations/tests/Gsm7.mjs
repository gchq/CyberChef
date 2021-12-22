/**
 * GSM-7 tests.
 *
 * @author edouard hinard []
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To GSM-7: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", false],
            },
        ],
    },
    {
        name: "To GSM-7: a real SMS",
        input: "a long sms with escapes [{ ~}) should be enough to validate encoding & packing",
        expectedOutput: "61 10 fb ed 3e 83 e6 ed 39 e8 9e a6 a3 41 e5 f9 38 0c 2f cf 41 1b de 06 05 da f4 36 a9 14 68 8e 7e d7 d9 64 90 b8 0c 2a bb df f5 33 1a 44 7f 83 ec 61 76 9a 1c a6 97 41 65 f7 f8 4d 4e bb cf 20 13 08 1e 1e af d3 ee 33",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", false],
            },
            {
                op: "To Hex",
                args: ["Space", 0],
            }
        ],
    },
    {
        name: "To GSM-7: not padding a 7 chars SMS",
        input: "7Chars.",
        expectedOutput: "b7 21 3a 2c 9f bb 00",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", false],
            },
            {
                op: "To Hex",
                args: ["Space", 0],
            }
        ],
    },
    {
        name: "To GSM-7: padding a 7 chars SMS",
        input: "7Chars.",
        expectedOutput: "b7 21 3a 2c 9f bb 00",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "To Hex",
                args: ["Space", 0],
            }
        ],
    },
    {
        name: "From GSM-7: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From GSM-7",
                args: [],
            },
        ],
    },
    {
        name: "From GSM-7: a real SMS",
        input: "61 10 fb ed 3e 83 e6 ed 39 e8 9e a6 a3 41 e5 f9 38 0c 2f cf 41 1b de 06 05 da f4 36 a9 14 68 8e 7e d7 d9 64 90 b8 0c 2a bb df f5 33 1a 44 7f 83 ec 61 76 9a 1c a6 97 41 65 f7 f8 4d 4e bb cf 20 13 08 1e 1e af d3 ee 33",
        expectedOutput: "a long sms with escapes [{ ~}) should be enough to validate encoding & packing",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "From GSM-7",
                args: [],
            }
        ],
    }
]);
