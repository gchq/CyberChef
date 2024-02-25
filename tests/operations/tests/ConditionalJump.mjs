/**
 * Conditional Jump tests
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Conditional Jump: Skips 0",
        input: ["should be changed"].join("\n"),
        expectedOutput: ["YzJodmRXeGtJR0psSUdOb1lXNW5aV1E9"].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", false, "", 0],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
        ],
    },
    {
        name: "Conditional Jump: Skips 1",
        input: ["should be changed"].join("\n"),
        // Expecting base32, not base64 output
        expectedOutput: ["ONUG65LMMQQGEZJAMNUGC3THMVSA===="].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["should", false, "skip match", 10],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
            {
                op: "Label",
                args: ["skip match"],
            },
            {
                op: "To Base32",
                args: ["A-Z2-7="],
            },
        ],
    },
    {
        name: "Conditional Jump: Skips backwards",
        input: ["match"].join("\n"),
        expectedOutput: ["f7cf556f7f4fc6635db8c314f7a81f2a"].join("\n"),
        recipeConfig: [
            {
                op: "Label",
                args: ["back to the beginning"],
            },
            {
                op: "Jump",
                args: ["skip replace"],
            },
            {
                op: "MD2",
                args: [],
            },
            {
                op: "Label",
                args: ["skip replace"],
            },
            {
                op: "Conditional Jump",
                args: ["match", false, "back to the beginning", 10],
            },
        ],
    },
]);
