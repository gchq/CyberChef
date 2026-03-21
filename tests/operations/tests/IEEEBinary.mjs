/**
 * IEEE754 Float64 tests.
 *
 * @author atsiv1 [atsiv1@proton.me]

 *
 * @copyright Crown Copyright
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From IEEEBinary: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: Zero (positive)",
        input: "0000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput: "0",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: Zero (negative)",
        input: "1000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput: "-0",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: 4.5",
        input: "0100000000010010000000000000000000000000000000000000000000000000",
        expectedOutput: "4.5",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: 0.1",
        input: "0011111110111001100110011001100110011001100110011001100110011010",
        expectedOutput:
            "0.1000000000000000055511151231257827021181583404541015625",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: Infinity",
        input: "0111111111110000000000000000000000000000000000000000000000000000",
        expectedOutput: "Infinity",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: -Infinity",
        input: "1111111111110000000000000000000000000000000000000000000000000000",
        expectedOutput: "-Infinity",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "From IEEEBinary: NaN",
        input: "0111111111111000000000000000000000000000000000000000000000000000",
        expectedOutput: "NaN",
        recipeConfig: [
            {
                op: "From IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: Zero",
        input: "0",
        expectedOutput:
            "0 00000000000 0000000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: -0",
        input: "-0",
        expectedOutput:
            "1 00000000000 0000000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: 4.5",
        input: "4.5",
        expectedOutput:
            "0 10000000001 0010000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: 0.1",
        input: "0.1",
        expectedOutput:
            "0 01111111011 1001100110011001100110011001100110011001100110011010",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: Infinity",
        input: "Infinity",
        expectedOutput:
            "0 11111111111 0000000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
    {
        name: "To IEEEBinary: NaN",
        input: "NaN",
        expectedOutput:
            "0 11111111111 1000000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                op: "To IEEEBinary",
                args: [],
            },
        ],
    },
]);
