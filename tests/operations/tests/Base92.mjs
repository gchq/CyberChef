/**
 * Base92 tests.
 *
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Base92: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base92",
                args: [],
            },
        ],
    },
    {
        name: "To Base92: Spec encoding example 1",
        input: "AB",
        expectedOutput: "8y2",
        recipeConfig: [
            {
                op: "To Base92",
                args: [],
            },
        ],
    },
    {
        name: "To Base92: Spec encoding example 2",
        input: "Hello!!",
        expectedOutput: ";K_$aOTo&",
        recipeConfig: [
            {
                op: "To Base92",
                args: [],
            },
        ],
    },
    {
        name: "To Base92: Spec encoding example 3",
        input: "base-92",
        expectedOutput: "DX2?V<Y(*",
        recipeConfig: [
            {
                op: "To Base92",
                args: [],
            },
        ],
    },
    {
        name: "From Base92: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base92",
                args: [],
            },
        ],
    },
    {
        name: "From Base92: Spec decoding example 1",
        input: "G'_DW[B",
        expectedOutput: "ietf!",
        recipeConfig: [
            {
                op: "From Base92",
                args: [],
            },
        ],
    },
    {
        name: "From Base92: Invalid character",
        input: "~",
        expectedOutput: "~ is not a base92 character",
        recipeConfig: [
            {
                op: "From Base92",
                args: [],
            },
        ],
    },
]);
