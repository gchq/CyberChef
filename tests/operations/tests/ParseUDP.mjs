/**
 * Parse UDP tests.
 *
 * @author h345983745
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse UDP: No Data - JSON",
        input: "04 89 00 35 00 2c 01 01",
        expectedOutput: "{\"Source port\":1161,\"Desination port\":53,\"Length\":44,\"Checksum\":\"0x010x01\"}",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "Parse UDP",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    }, {
        name: "Parse UDP: With Data - JSON",
        input: "04 89 00 35 00 2c 01 01 02 02",
        expectedOutput: "{\"Source port\":1161,\"Desination port\":53,\"Length\":44,\"Checksum\":\"0x010x01\",\"Data\":\"0x020x02\"}",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "Parse UDP",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "Parse UDP: Not Enough Bytes",
        input: "04 89 00",
        expectedOutput: "Need 8 bytes for a UDP Header",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "Parse UDP",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    }
]);
