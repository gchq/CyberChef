/**
 * AMF Decode tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "AMF3 Decode: empty input error",
        input: "",
        expectedOutput: "Could not decode AMF3 data: input is empty.",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"]
            }
        ],
    },
    {
        name: "AMF3 Decode: newline input error",
        input: "\n",
        expectedOutput: "Could not decode AMF3 data. The input may be invalid or incomplete.",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"]
            }
        ],
    },
    {
        name: "AMF3 Decode: truncated object input error",
        input: "\x0a\x13\x01\x03a\x05\x40\x08",
        expectedOutput: "Could not decode AMF3 data. The input may be invalid or incomplete.",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"]
            }
        ],
    },
    {
        name: "AMF3 Decode: truncated array input error",
        input: "\x09\x13\x01\x03a\x05\x40\x08",
        expectedOutput: "Could not decode AMF3 data. The input may be invalid or incomplete.",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"]
            }
        ],
    },
]);
