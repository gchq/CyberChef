/**
 * From Base operation tests.
 *
 * @author Willi Ballenthin
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From Base: binary integer",
        input: "1010",
        expectedOutput: "10",
        recipeConfig: [
            {
                op: "From Base",
                args: [2],
            },
        ],
    },
    {
        name: "From Base: binary fraction",
        input: "10.1",
        expectedOutput: "2.5",
        recipeConfig: [
            {
                op: "From Base",
                args: [2],
            },
        ],
    },
    {
        name: "From Base: hex fraction",
        input: "a.8",
        expectedOutput: "10.5",
        recipeConfig: [
            {
                op: "From Base",
                args: [16],
            },
        ],
    },
    {
        name: "From Base: octal integer",
        input: "77",
        expectedOutput: "63",
        recipeConfig: [
            {
                op: "From Base",
                args: [8],
            },
        ],
    },
    {
        name: "From Base: octal fraction",
        input: "7.4",
        expectedOutput: "7.5",
        recipeConfig: [
            {
                op: "From Base",
                args: [8],
            },
        ],
    },
]);
