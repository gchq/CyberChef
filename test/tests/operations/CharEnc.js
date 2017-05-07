/**
 * CharEnc tests.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "From EBCDIC: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "From EBCDIC",
                "args": ["IBM EBCDIC International"]
            },
        ],
    },
    {
        name: "From EBCDIC: hello",
        input: "88 85 93 93 96",
        expectedOutput: "hello",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "From EBCDIC",
                "args": ["IBM EBCDIC International"]
            },
        ],
    },
    {
        name: "To EBCDIC: hello",
        input: "hello",
        expectedOutput: "88 85 93 93 96",
        recipeConfig: [
            {
                "op": "To EBCDIC",
                "args": ["IBM EBCDIC International"]
            },
            {
                "op": "To Hex",
                "args": ["Space"]
            },
        ],
    },
]);
