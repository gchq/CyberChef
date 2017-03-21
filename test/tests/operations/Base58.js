/**
 * Base58 tests.
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
var TestRegister = require("../../TestRegister.js");

TestRegister.addTests([
    {
        name: "To Base58 (Bitcoin): nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base58",
                args: ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"],
            },
        ],
    },
    {
        name: "To Base58 (Ripple): nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base58",
                args: ["rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"],
            },
        ],
    },
    {
        name: "To Base58 (Bitcoin): 'hello world'",
        input: "hello world",
        expectedOutput: "StV1DL6CwTryKyV",
        recipeConfig: [
            {
                op: "To Base58",
                args: ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"],
            },
        ],
    },
    {
        name: "To Base58 (Ripple): 'hello world'",
        input: "hello world",
        expectedOutput: "StVrDLaUATiyKyV",
        recipeConfig: [
            {
                op: "To Base58",
                args: ["rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"],
            },
        ],
    },
    {
        name: "From Base58 (Bitcoin): 'StV1DL6CwTryKyV'",
        input: "StV1DL6CwTryKyV",
        expectedOutput: "hello world",
        recipeConfig: [
            {
                op: "From Base58",
                args: ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"],
            },
        ],
    },
    {
        name: "From Base58 (Ripple): 'StVrDLaUATiyKyV'",
        input: "StVrDLaUATiyKyV",
        expectedOutput: "hello world",
        recipeConfig: [
            {
                op: "From Base58",
                args: ["rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"],
            },
        ],
    },
]);
