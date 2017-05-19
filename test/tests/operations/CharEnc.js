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
        name: "Encode text, Decode text: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["UTF-8 (65001)"]
            },
            {
                "op": "Decode text",
                "args": ["UTF-8 (65001)"]
            },
        ],
    },
    {
        name: "Encode text, Decode text: hello",
        input: "hello",
        expectedOutput: "hello",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["UTF-8 (65001)"]
            },
            {
                "op": "Decode text",
                "args": ["UTF-8 (65001)"]
            },
        ],
    },
    {
        name: "Encode text (EBCDIC): hello",
        input: "hello",
        expectedOutput: "88 85 93 93 96",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["IBM EBCDIC International (500)"]
            },
            {
                "op": "To Hex",
                "args": ["Space"]
            },
        ],
    },
    {
        name: "Decode text (EBCDIC): 88 85 93 93 96",
        input: "88 85 93 93 96",
        expectedOutput: "hello",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "Decode text",
                "args": ["IBM EBCDIC International (500)"]
            },
        ],
    },
]);
