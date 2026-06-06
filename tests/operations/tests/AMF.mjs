/**
 * AMF tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "AMF3 Encode: object string",
        input: "{\"a\": \"test\"}",
        expectedOutput: "0a13010361060974657374",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "AMF3 Encode: object boolean true",
        input: "{\"a\": true}",
        expectedOutput: "0a1301036103",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "AMF3 Encode: object boolean false",
        input: "{\"a\": false}",
        expectedOutput: "0a1301036102",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "AMF3 Encode: object null",
        input: "{\"a\": null}",
        expectedOutput: "0a1301036101",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "AMF3 Encode: object array",
        input: "{\"a\": []}",
        expectedOutput: "0a13010361090101",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "AMF3 Encode: object nested JSON values",
        input: "{\"a\": [true, false, null, \"x\", 1]}",
        expectedOutput: "0a13010361090b01030201060378053ff0000000000000",
        recipeConfig: [
            {
                op: "AMF Encode",
                args: ["AMF3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
]);
