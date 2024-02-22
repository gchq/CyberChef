/**
 * Jump tests
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Jump: Empty Label",
        input: [
            "should be changed",
        ].join("\n"),
        expectedOutput: [
            "c2hvdWxkIGJlIGNoYW5nZWQ=",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["", 10],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
        ],
    },
    {
        name: "Jump: skips 1",
        input: [
            "shouldnt be changed",
        ].join("\n"),
        expectedOutput: [
            "shouldnt be changed",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["skipReplace", 10],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
            {
                op: "Label",
                args: ["skipReplace"]
            },
        ],
    }
]);
