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
        name: "Bencode Decode: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Bencode Decode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Decode: integer",
        input: "i42e",
        expectedOutput: "42",
        recipeConfig: [
            {
                "op": "Bencode Decode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Decode: byte string",
        input: "7:bencode",
        expectedOutput: "bencode",
        recipeConfig: [
            {
                "op": "Bencode Decode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Decode: list",
        input: "l7:bencodei-20ee",
        expectedOutput: `["bencode",-20]`,
        recipeConfig: [
            {
                "op": "Bencode Decode",
                "args": []
            }
        ]
    },
    {
        name: "Bencode Decode: dictionary",
        input: "d7:meaningi42e4:wiki7:bencodee",
        expectedOutput: `{"meaning":42,"wiki":"bencode"}`,
        recipeConfig: [
            {
                "op": "Bencode Decode",
                "args": []
            }
        ]
    },
]);
