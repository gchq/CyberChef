/**
 * Private key to secp256k1 public key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Basic Base58 Check Decoding",
        input: "1111111111111111111114oLvT2",
        expectedOutput: "{\n    \"version\": \"\",\n    \"checksum\": \"94a00911\",\n    \"data\": \"000000000000000000000000000000000000000000\"\n}",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [0]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Invalid Checksum)",
        input: "1111111111111111111114oLvT3",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [0]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Invalid Checksum Leading Zeros 1)",
        input: "111111111111111111114oLvT2",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [0]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Invalid Checksum Leading Zeros 2)",
        input: "11111111111111111111114oLvT2",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [0]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Invalid Checksum Leading Zeros 2 With Single Version Byte)",
        input: "11111111111111111111114oLvT2",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [1]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding Gibberish",
        input: "A9CfWPWwyc4JC4ATfv4ajp9aGunQ375hLHQ8gcY",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [1]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Invalid Checksum With one Byte Version)",
        input: "1111111111111111111114oLvT3",
        expectedOutput: "Invalid Checksum.",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [1]
            }
        ],
    },
    {
        name: "Basic Base58 Check Decoding (Version Length 1)",
        input: "1111111111111111111114oLvT2",
        expectedOutput: "{\n    \"version\": \"00\",\n    \"checksum\": \"94a00911\",\n    \"data\": \"0000000000000000000000000000000000000000\"\n}",
        recipeConfig: [
            {
                "op": "From Base58Check",
                "args": [1]
            }
        ],
    },
    {
        name: "To Base58 Check Basic",
        input: "0000000000000000000000000000000000000000",
        expectedOutput: "1111111111111111111114oLvT2",
        recipeConfig: [
            {
                "op": "To Base58Check",
                "args": [{ "option": "Hex", "string": "00" }]
            }
        ]
    },
    {
        name: "To and From Base58 Check",
        input: "0000000000000000000000000000000000000000",
        expectedOutput: "{\n    \"version\": \"00\",\n    \"checksum\": \"94a00911\",\n    \"data\": \"0000000000000000000000000000000000000000\"\n}",
        recipeConfig: [
            {
                "op": "To Base58Check",
                "args": [{ "option": "Hex", "string": "00" }]
            },
            {
                "op": "From Base58Check",
                "args": [1]
            }
        ]

    },
    {
        name: "To and From Base58 Check (Technically wrong version byte length",
        input: "0000000000000000000000000000000000000000",
        expectedOutput: "{\n    \"version\": \"0000000000\",\n    \"checksum\": \"94a00911\",\n    \"data\": \"00000000000000000000000000000000\"\n}",
        recipeConfig: [
            {
                "op": "To Base58Check",
                "args": [{ "option": "Hex", "string": "00" }]
            },
            {
                "op": "From Base58Check",
                "args": [5]
            }
        ]

    }

]);
