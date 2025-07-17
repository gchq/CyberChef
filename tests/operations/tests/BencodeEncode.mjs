/**
 * Bencode Encode tests.
 *
 * @author jg42526
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Bencode Encode: nothing",
        input: "",
        expectedOutput: "0:",
        recipeConfig: [
            {
                "op": "Bencode Encode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Encode: integer",
        input: "42",
        expectedOutput: "i42e",
        recipeConfig: [
            {
                "op": "Bencode Encode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Encode: byte string",
        input: "bencode",
        expectedOutput: "7:bencode",
        recipeConfig: [
            {
                "op": "Bencode Encode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Encode: list",
        input: `[
            "bencode",
            -20
        ]`,
        expectedOutput: "l7:bencodei-20ee",
        recipeConfig: [
            {
                "op": "Bencode Encode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Encode: dictionary",
        input: `{
            "meaning": 42,
            "wiki": "bencode"
        }`,
        expectedOutput: "d7:meaningi42e4:wiki7:bencodee",
        recipeConfig: [
            {
                "op": "Bencode Encode",
                "args": []
            }
        ]
    },
]);
