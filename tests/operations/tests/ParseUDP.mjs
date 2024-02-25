/**
 * Parse UDP tests.
 *
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse UDP: No Data - JSON",
        input: "04 89 00 35 00 2c 01 01",
        expectedOutput:
            '{"Source port":1161,"Destination port":53,"Length":44,"Checksum":"0x0101"}',
        recipeConfig: [
            {
                op: "Parse UDP",
                args: ["Hex"],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "Parse UDP: With Data - JSON",
        input: "04 89 00 35 00 2c 01 01 02 02",
        expectedOutput:
            '{"Source port":1161,"Destination port":53,"Length":44,"Checksum":"0x0101","Data":"0x0202"}',
        recipeConfig: [
            {
                op: "Parse UDP",
                args: ["Hex"],
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
                op: "Parse UDP",
                args: ["Hex"],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
]);
