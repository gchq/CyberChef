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
                args: [],
            },
        ],
    },
    {
        name: "To GSM-7: a real SMS",
        input: "a long sms with escapes [{ ~}) should be enough to validate encoding & packing",
        expectedOutput: "61 10 FB ED 3E 83 E6 ED 39 E8 9E A6 A3 41 E5 F9 38 0C 2F CF 41 1B DE 06 05 DA F4 36 A9 14 68 8E 7E D7 D9 64 90 B8 0C 2A BB DF F5 33 1A 44 7F 83 EC 61 76 9A 1C A6 97 41 65 F7 F8 4D 4E BB CF 20 13 08 1E 1E AF D3 EE 33",
        recipeConfig: [
            {
                op: "To GSM-7",
                args: [],
            },
            {
                op: "To Hex",
                args: ["Space", 0],
            }
        ],
    },
    {
        name: "To GSM-7: not padding a 7 chars SMS",
        input: "7chars.",
        expectedOutput: "B7 21 3A 2C 9F BB 00",
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
        input: "7chars.",
        expectedOutput: "B7 21 3A 2C 9F BB 00",
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
        input: "61 10 FB ED 3E 83 E6 ED 39 E8 9E A6 A3 41 E5 F9 38 0C 2F CF 41 1B DE 06 05 DA F4 36 A9 14 68 8E 7E D7 D9 64 90 B8 0C 2A BB DF F5 33 1A 44 7F 83 EC 61 76 9A 1C A6 97 41 65 F7 F8 4D 4E BB CF 20 13 08 1E 1E AF D3 EE 33",
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
