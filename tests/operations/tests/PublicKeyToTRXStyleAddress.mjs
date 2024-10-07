/**
 * Public Key to TRX Style Address Cryptocurrency Address tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Public Key To TRX Style Address",
        input: "04187ac6bc2723630c936e363b826de17dac62382e3bbfabf306ad5f55cc79538783889fe32946b52092dad24c56893d522413d67e62b28f6c54f14821367a9edc",
        expectedOutput: "THV2shRZn4cam7aQreAg9aixfk2sTcho6r",
        recipeConfig: [
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key To TRX Style Address Compressed Key",
        input: "02d1b5855d3f99c4449eb7af576bec1b9bc0bf0769446820686d2de5c47c13b1a0",
        expectedOutput: "TQS4NjvDN4TxcZd8LwD1eAKv9y4vSVkDW2",
        recipeConfig: [
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key 2",
        input: "03a85e8f6fc71898b5c3347decd2c0bba8abb99393c8358fcf0bca72e4c7d68514",
        expectedOutput: "TXBP2ebjZsnDEL9X5xCZSZZ6FC3Vppccv4",
        recipeConfig: [
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key 2 (From Hex)",
        input: "03a85e8f6fc71898b5c3347decd2c0bba8abb99393c8358fcf0bca72e4c7d68514",
        expectedOutput: "TXBP2ebjZsnDEL9X5xCZSZZ6FC3Vppccv4",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To TRX Style Address",
                "args": [],
            },
        ],

    },
    {
        name: "Public Key to TRX Style Address: Compressed Key (From Hex)",
        input: "02d1b5855d3f99c4449eb7af576bec1b9bc0bf0769446820686d2de5c47c13b1a0",
        expectedOutput: "TQS4NjvDN4TxcZd8LwD1eAKv9y4vSVkDW2",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key To TRX Style Address (From Hex)",
        input: "04187ac6bc2723630c936e363b826de17dac62382e3bbfabf306ad5f55cc79538783889fe32946b52092dad24c56893d522413d67e62b28f6c54f14821367a9edc",
        expectedOutput: "THV2shRZn4cam7aQreAg9aixfk2sTcho6r",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            },
        ],

    },
]);
