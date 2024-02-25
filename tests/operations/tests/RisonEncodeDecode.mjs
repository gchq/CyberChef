/**
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Rison Encode: Encoding example 1",
        input: JSON.stringify({ any: "json", yes: true }),
        expectedOutput: "(any:json,yes:!t)",
        recipeConfig: [
            {
                op: "Rison Encode",
                args: ["Encode"],
            },
        ],
    },
    {
        name: "Rison Encode: Encoding example 2",
        input: JSON.stringify({ supportsObjects: true, ints: 435 }),
        expectedOutput: "ints:435,supportsObjects:!t",
        recipeConfig: [
            {
                op: "Rison Encode",
                args: ["Encode Object"],
            },
        ],
    },
    {
        name: "Rison Encode: Encoding example 3",
        input: JSON.stringify(["A", "B", { supportsObjects: true }]),
        expectedOutput: "A,B,(supportsObjects:!t)",
        recipeConfig: [
            {
                op: "Rison Encode",
                args: ["Encode Array"],
            },
        ],
    },
    {
        name: "Rison Encode: Object for an array",
        input: JSON.stringify({ supportsObjects: true, ints: 435 }),
        expectedOutput:
            "Rison Encode - rison.encode_array expects an array argument",
        expectedError:
            "Rison Encode - rison.encode_array expects an array argument",
        recipeConfig: [
            {
                op: "Rison Encode",
                args: ["Encode Array"],
            },
        ],
    },
    {
        name: "Rison Decode: Decoding example 1",
        input: "(any:json,yes:!t)",
        expectedOutput: JSON.stringify({ any: "json", yes: true }, null, 4),
        recipeConfig: [
            {
                op: "Rison Decode",
                args: ["Decode"],
            },
        ],
    },
]);
