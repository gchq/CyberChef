/**
 * Strip TCP header tests.
 *
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Strip TCP header: No options, No payload",
        input: "7f900050000fa4b2000cb2a45010bff100000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: No options, Payload",
        input: "7f900050000fa4b2000cb2a45010bff100000000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Options, No payload",
        input: "7f900050000fa4b2000cb2a47010bff100000000020405b404020000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Options, Payload",
        input: "7f900050000fa4b2000cb2a47010bff100000000020405b404020000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Input length less than minimum header length",
        input: "7f900050000fa4b2000cb2a45010bff1000000",
        expectedOutput: "Need at least 20 bytes for a TCP Header",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Input length less than data offset",
        input: "7f900050000fa4b2000cb2a47010bff100000000",
        expectedOutput: "Input length is less than data offset",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip TCP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    }
]);
