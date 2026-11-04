/**
 * AMFDecode tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "AMF Decode: empty input",
        input: "",
        expectedOutput: "No input",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"],
            },
        ],
    },
    {
        name: "AMF Decode: empty input, AMF0",
        input: "",
        expectedOutput: "No input",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF0"],
            },
        ],
    },
    {
        name: "AMF Decode: invalid input (newline)",
        input: "\n",
        expectedOutput: "Could not decode AMF data: incompleteResult.contextHint is not a function",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"],
            },
        ],
    },
    {
        name: "AMF Decode: truncated input",
        input: "061b4865",
        expectedOutput: "Could not decode AMF data: Buffer exhausted while reading 104 bits at offset 16, context:\n     - [StringSerializer] StringOrReference#$value\n     - [readField()] StringOrReference#$value\n     - [read()] StringOrReference\n     - [StringOrReference.read()] StringOrReference\n     - [readField()] StringValue#stringOrReference\n     - [readOwn()] StringValue\n     - [StringValue.readVariant()] StringValue\n     - [variate()] ReferenceValue\n     - [tail-variation] ReferenceValue\n     - [variate()] Value\n     - [tail-variation] Value\n\n",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "AMF Decode",
                args: ["AMF3"],
            },
        ],
    },
    {
        name: "AMF Decode: AMF3 string",
        input: "061b48656c6c6f2c20576f726c6421",
        expectedOutput: "{\n    \"marker\": 6,\n    \"stringOrReference\": {\n        \"$lengthOrReference\": 27,\n        \"$value\": \"Hello, World!\"\n    }\n}",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "AMF Decode",
                args: ["AMF3"],
            },
        ],
    },
]);
