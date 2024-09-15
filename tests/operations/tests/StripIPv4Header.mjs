/**
 * Strip IPv4 header tests.
 *
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Strip IPv4 header: No options, No payload",
        input: "450000140005400080060000c0a80001c0a80002",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: No options, Payload",
        input: "450000140005400080060000c0a80001c0a80002ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Options, No payload",
        input: "460000140005400080060000c0a80001c0a8000207000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Options, Payload",
        input: "460000140005400080060000c0a80001c0a8000207000000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Input length lesss than minimum header length",
        input: "450000140005400080060000c0a80001c0a800",
        expectedOutput: "Input length is less than minimum IPv4 header length",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Input length less than IHL",
        input: "460000140005400080060000c0a80001c0a80000",
        expectedOutput: "Input length is less than IHL",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip IPv4 header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    }
]);
