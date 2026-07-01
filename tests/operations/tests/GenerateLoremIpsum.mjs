/**
 * Generate Lorem Ipsum tests
 *
 * @author GCHQDeveloper581
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate Lorem Ipsum: Exceeds Word Limit",
        input: "",
        expectedOutput: "Length must be less than 100000",
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [999_999, "Words"]
            },
        ],
    },
    {
        name: "Generate Lorem Ipsum: Within Word Limit",
        input: "",
        // each word is >= 3 characters long, so expect at least 3000 characters
        expectedMatch: /.{3000,}/s,
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [1000, "Words"]
            },
        ],
    },
    {
        name: "Generate Lorem Ipsum: Exceeds Byte Limit",
        input: "",
        expectedOutput: "Length must be less than 1000000",
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [1_000_001, "Bytes"]
            },
        ],
    },
    {
        name: "Generate Lorem Ipsum: Exceeds Sentence Limit",
        input: "",
        expectedOutput: "Length must be less than 100000",
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [999_999, "Sentences"]
            },
        ],
    },
    {
        name: "Generate Lorem Ipsum: Exceeds Paragraph Limit",
        input: "",
        expectedOutput: "Length must be less than 100000",
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [999_999, "Paragraphs"]
            },
        ],
    },
    {
        name: "Generate Lorem Ipsum: Incorrect lengthType",
        input: "",
        expectedOutput: "Length in must be one of the following: Paragraphs, Sentences, Words, Bytes",
        recipeConfig: [
            {
                "op": "Generate Lorem Ipsum",
                "args": [999_999, "Novels"]
            }
        ],
    },


]);
