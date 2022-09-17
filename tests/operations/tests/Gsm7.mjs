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
            {
                op: "To Hex",
                args: ["Space", 0],
            }
        ],
    },
    {
        name: "To GSM-7: a real SMS sent over IP",
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
        name: "To GSM-7: smiley",
        input: "😀",
        expectedOutput: "character '😀' is not present in current charset+extension.<br>A real device would encode this SMS using UCS-2 (UTF-16)",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", false],
            }
        ],
    },
    {
        name: "From GSM-7: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", true],
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
                args: ["Default", "Default", true],
            }
        ],
    },
    {
        name: "GSM-7: padding/not unpadding a %7 chars SMS",
        input: "7Chars.",
        expectedOutput: "7Chars.\r",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", false],
            }
        ],
    },
    {
        name: "GSM-7: padding/unpadding a %7 chars SMS",
        input: "twenty three characters",
        expectedOutput: "twenty three characters",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", true],
            }
        ],
    },
    {
        name: "GSM-7: not padding/not unpadding a %7 chars SMS",
        input: "<15 characters>",
        expectedOutput: "<15 characters>@",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", false],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", false],
            }
        ],
    },
    {
        name: "GSM-7: padding/not unpadding a 8 chars SMS",
        input: "8 chars.",
        expectedOutput: "8 chars.",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", false],
            }
        ],
    },
    {
        name: "GSM-7: padding/not unpadding a 8 chars SMS with final CR",
        input: "8 chars\r",
        expectedOutput: "8 chars\r\r",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", false],
            }
        ],
    },
    {
        name: "GSM-7: padding/unpadding a 8 chars SMS with final CR",
        input: "8 chars\r",
        expectedOutput: "8 chars\r\r",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: ["Default", "Default", true],
            },
            {
                op: "From GSM-7",
                args: ["Default", "Default", true],
            }
        ],
    }
]);
