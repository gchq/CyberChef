/**
 * Public Key to ETH Style Address Cryptocurrency Address tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Public Key To ETH Style Address",
        input: "04d26bcecd763bdf6bdb89ba929d2485429fbda73bae723d525ef55554ef45350582085bd24055079f6deebad5b6af612c14587c6862391d330484afe750fbf144",
        expectedOutput: "0x63e8b85679d29235791a0f558d6485c7ed51c9e6",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key To ETH Style Address 2",
        input: "047d3e5107b46421c3ddf7292fcbe1f5805952279926c325d119f6ddfed1e5e7ea9a9f5dceadc57b897cb286479450b66a6422f8f270bcd2a61ab4eea800911956",
        expectedOutput: "0x099f75d5bc069026531394d5c6d6c37a41158d31",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key To ETH Style Address Invalid Uncompressed Key",
        input: "027d3e5107b46421c3ddf7292fcbe1f5805952279926c325d119f6ddfed1e5e7ea9a9f5dceadc57b897cb286479450b66a6422f8f270bcd2a61ab4eea800911956",
        expectedOutput: "We have a valid hex string of reasonable length, (130) but doesn't start with the right value. Correct values are 04 but we have: 02",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key",
        input: "027d3e5107b46421c3ddf7292fcbe1f5805952279926c325d119f6ddfed1e5e7ea",
        expectedOutput: "0x099f75d5bc069026531394d5c6d6c37a41158d31",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Blank Input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Invalid Compressed Key",
        input: "059d491d3f5a2a79b422b76b8115b175b38e42c6103b1a84c88fb6221fe9072bbe",
        expectedOutput: "We have a valid hex string, of reasonable length, (66) but doesn't start with the right value. Correct values are 02, or 03 but we have: 05",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": [],
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key 2",
        input: "039d491d3f5a2a79b422b76b8115b175b38e42c6103b1a84c88fb6221fe9072bbe",
        expectedOutput: "0x345029d286159d516ca1169edf0a80ff6c855ac0",
        recipeConfig: [
            {
                "op": "Public Key To ETH Style Address",
                "args": [],
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key (From Hex)",
        input: "027d3e5107b46421c3ddf7292fcbe1f5805952279926c325d119f6ddfed1e5e7ea",
        expectedOutput: "0x099f75d5bc069026531394d5c6d6c37a41158d31",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },
    {
        name: "Public Key to ETH Style Address: Compressed Key 2 (From Hex)",
        input: "039d491d3f5a2a79b422b76b8115b175b38e42c6103b1a84c88fb6221fe9072bbe",
        expectedOutput: "0x345029d286159d516ca1169edf0a80ff6c855ac0",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To ETH Style Address",
                "args": [],
            },
        ],

    },
    {
        name: "Public Key To ETH Style Address (From Hex)",
        input: "04d26bcecd763bdf6bdb89ba929d2485429fbda73bae723d525ef55554ef45350582085bd24055079f6deebad5b6af612c14587c6862391d330484afe750fbf144",
        expectedOutput: "0x63e8b85679d29235791a0f558d6485c7ed51c9e6",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            },
        ],

    },

]);
