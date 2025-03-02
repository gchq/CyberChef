/**
 * @author r4mos [2k95ljkhg@mozmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib//TestRegister.mjs";

TestRegister.addApiTests([
    {
        name: "CRC-3/GSM",
        input: "123456789",
        expectedOutput: "4",
        recipeConfig: [
            {
                "op": "CRC Checksum",
                "args": ["CRC-3/GSM"]
            }
        ]
    }
]);
