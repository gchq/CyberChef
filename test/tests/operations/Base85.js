/**
 * Base85 tests.
 *
 * @author George J [george@penguingeorge.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "To Base85 (Standard): nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base85",
                args: [null, false],
            },
        ],
    },
    {
        name: "To Base85 (Standard (Ascii85)): Hello, World!",
        input: "Hello, World!",
        expectedOutput: "87cURD_*#4DfTZ)+T",
        recipeConfig: [
            {
                op: "To Base85",
                args: [null, false],
            },
        ],
    },
    {
        name: "To Base85 (Standard (Ascii85)): UTF-8",
        input: "ნუ პანიკას",
        expectedOutput: "iIdZZK;0RJK:_%SOPth^iIdNVK:1\\NOPthc",
        recipeConfig: [
            {
                op: "To Base85",
                args: [null, false],
            },
        ],
    },
    {
        name: "To Base85 (Z85 (ZeroMQ)): Hello, World!",
        input: "Hello, World!",
        expectedOutput: "nm2QNz.92jz5PV8aP",
        recipeConfig: [
            {
                op: "To Base85",
                args: ["0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#", false],
            },
        ],
    },
    {
        name: "From Base85 (Standard): nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base85",
                args: [null, false],
            },
        ],
    },
    {
        name: "From Base85 (Standard): Hello, World!",
        input: "87cURD_*#4DfTZ)+T",
        expectedOutput: "Hello, World!",
        recipeConfig: [
            {
                op: "From Base85",
                args: [null, false],
            },
        ],
    },
    {
        name: "From Base85 (Standard): UTF-8",
        input: "iIdZZK;0RJK:_%SOPth^iIdNVK:1\\NOPthc",
        expectedOutput: "ნუ პანიკას",
        recipeConfig: [
            {
                op: "From Base85",
                args: [null, false],
            },
        ],
    },
]);
