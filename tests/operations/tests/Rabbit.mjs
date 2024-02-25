/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Rabbit: RFC Test vector, without IV 1",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "b15754f036a5d6ecf56b45261c4af70288e8d815c59c0c397b696c4789c68aa7f416a1c3700cd451da68d1881673d696",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: RFC Test vector, without IV 2",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "3d2df3c83ef627a1e97fc38487e2519cf576cd61f4405b8896bf53aa8554fc19e5547473fbdb43508ae53b20204d4c5e",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "912813292e3d36fe3bfc62f1dc51c3ac" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: RFC Test vector, without IV 3",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "0cb10dcda041cdac32eb5cfd02d0609b95fc9fca0f17015a7b7092114cff3ead9649e5de8bfc7f3f924147ad3a947428",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "8395741587e0c733e9e9ab01c09b0043" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: RFC Test vector, with IV 1",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "c6a7275ef85495d87ccd5d376705b7ed5f29a6ac04f5efd47b8f293270dc4a8d2ade822b29de6c1ee52bdb8a47bf8f66",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "0000000000000000" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: RFC Test vector, with IV 2",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "1fcd4eb9580012e2e0dccc9222017d6da75f4e10d12125017b2499ffed936f2eebc112c393e738392356bdd012029ba7",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "c373f575c1267e59" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: RFC Test vector, with IV 3",
        input: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput:
            "445ad8c805858dbf70b6af23a151104d96c8f27947f42c5baeae67c6acc35b039fcbfc895fa71c17313df034f01551cb",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "a6eb561ad2f41727" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: generated stream should be XORed with the input",
        input: "cedda96c054e3ddd93da7ed05e2a4b7bdb0c00fe214f03502e2708b2c2bfc77aa2311b0b9af8aa78d119f92b26db0a6b",
        expectedOutput:
            "7f8afd9c33ebeb3166b13bf64260bc7953e4d8ebe4d30f69554e64f54b794ddd5627bac8eaf47e290b7128a330a8dcfd",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: least significant bits should be used for the last block",
        input: "0000000000000000",
        expectedOutput: "f56b45261c4af702",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: invalid key length",
        input: "",
        expectedOutput: "Invalid key length: 8 bytes (expected: 16)",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "0000000000000000" },
                    { "option": "Hex", "string": "" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        name: "Rabbit: invalid IV length",
        input: "",
        expectedOutput: "Invalid IV length: 4 bytes (expected: 0 or 8)",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "00000000000000000000000000000000" },
                    { "option": "Hex", "string": "00000000" },
                    "Big",
                    "Hex",
                    "Hex"
                ]
            }
        ]
    },
    {
        // this testcase is taken from the first example on Crypto++ Wiki
        // https://www.cryptopp.com/wiki/Rabbit
        name: "Rabbit: little-endian mode (Crypto++ compatible)",
        input: "Rabbit stream cipher test",
        expectedOutput: "1ae2d4edcf9b6063b00fd6fda0b223aded157e77031cf0440b",
        recipeConfig: [
            {
                "op": "Rabbit",
                "args": [
                    { "option": "Hex", "string": "23c2731e8b5469fd8dabb5bc592a0f3a" },
                    { "option": "Hex", "string": "712906405ef03201" },
                    "Little",
                    "Raw",
                    "Hex"
                ]
            }
        ]
    }
]);
