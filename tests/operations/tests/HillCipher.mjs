/**
 * HillCipher tests
 *
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Hill Cipher Encode",
        input: "Hello World",
        expectedOutput: "tutrquwdnv",
        recipeConfig: [
            { "op": "Hill Cipher Encode",
                "args": ["Test"] }
        ]
    },
    {
        name: "Hill Cipher Decode",
        input: "tutrquwdnv",
        expectedOutput: "helloworld",
        recipeConfig: [
            { "op": "Hill Cipher Decode",
                "args": ["Test"] }
        ]
    },
    {
        name: "Hill Cipher Bad Matrix",
        input: "Hello World",
        expectedOutput: "Determinant has common factors with the modular base.",
        recipeConfig: [
            { "op": "Hill Cipher Encode",
                "args": ["th"] }
        ]
    },
    {
        name: "Hill Cipher Empty Key",
        input: "Hello World",
        expectedOutput: "",
        recipeConfig: [
            { "op": "Hill Cipher Encode",
                "args": [""] }
        ]
    }
]);
