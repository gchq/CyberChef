/**
 * BitwiseOp tests
 *
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "BLAKE2b: 512 - Hello World",
        input: "Hello World",
        expectedOutput: "4386a08a265111c9896f56456e2cb61a64239115c4784cf438e36cc851221972da3fb0115f73cd02486254001f878ab1fd126aac69844ef1c1ca152379d0a9bd",
        recipeConfig: [
            { "op": "BLAKE2b",
                "args": ["512", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2b: 384 - Hello World",
        input: "Hello World",
        expectedOutput: "4d388e82ca8f866e606b6f6f0be910abd62ad6e98c0adfc27cf35acf948986d5c5b9c18b6f47261e1e679eb98edf8e2d",
        recipeConfig: [
            { "op": "BLAKE2b",
                "args": ["384", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2b: 256 - Hello World",
        input: "Hello World",
        expectedOutput: "1dc01772ee0171f5f614c673e3c7fa1107a8cf727bdf5a6dadb379e93c0d1d00",
        recipeConfig: [
            { "op": "BLAKE2b",
                "args": ["256", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2b: 160 - Hello World",
        input: "Hello World",
        expectedOutput: "6a8489e6fd6e51fae12ab271ec7fc8134dd5d737",
        recipeConfig: [
            { "op": "BLAKE2b",
                "args": ["160", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2b: Key Test",
        input: "message data",
        expectedOutput: "3d363ff7401e02026f4a4687d4863ced",
        recipeConfig: [
            { "op": "BLAKE2b",
                "args": ["128", "Hex", {string: "pseudorandom key", option: "UTF8"}] }
        ]
    }
]);
