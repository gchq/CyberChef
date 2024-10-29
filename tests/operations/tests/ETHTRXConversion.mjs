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
        name: "ETH To TRX",
        input: "0xAb495f468B0bF116860E76be9f26339b2CbC33c3",
        expectedOutput: "TRatSrEqUKLK4eNWL8NSrvEbpeht5takWd",
        recipeConfig: [
            {
                "op": "ETH / TRX Conversion",
                "args": ["ETH->TRX"]
            },
        ],

    },
    {
        name: "TRX to ETH",
        input: "TRatSrEqUKLK4eNWL8NSrvEbpeht5takWd",
        expectedOutput: "0xAb495f468B0bF116860E76be9f26339b2CbC33c3",
        recipeConfig: [
            {
                "op": "ETH / TRX Conversion",
                "args": ["TRX->ETH"]
            },
        ],

    },
    {
        name: "TRX to ETH With Checksum",
        input: "TF8xufByTvQmf5gssBzosfmCFoJyJpzZtj",
        expectedOutput: "0x38b10632a1F3B4363cF1852D12ff492808aA3675",
        recipeConfig: [
            {
                "op": "ETH / TRX Conversion",
                "args": ["TRX->ETH"]
            },
        ]

    },
]);
