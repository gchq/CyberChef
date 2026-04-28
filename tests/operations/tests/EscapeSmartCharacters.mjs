/**
 * Escape Smart Characters tests.
 *
 * @author min23asdw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Escape Smart Characters: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: ASCII passthrough",
        input: "Hello, World! 123",
        expectedOutput: "Hello, World! 123",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: smart quotes and dashes",
        input: "\u201C\u201D\u2014\u2018\u2019 \u2192\u00A9\u2026",
        expectedOutput: "\"\"--'' -->(C)...",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: guillemets and arrows",
        input: "\u00AB\u00BB \u2190\u2194\u21D2",
        expectedOutput: "<<>> <--<->==>",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: Remove unrecognised",
        input: "\u201CHello\u201D \u2603",
        expectedOutput: "\"Hello\" ",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Remove"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: Replace unrecognised with '.'",
        input: "\u201CHello\u201D \u2603",
        expectedOutput: "\"Hello\" .",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Replace with '.'"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: Include unrecognised",
        input: "\u201CHello\u201D \u2603",
        expectedOutput: "\"Hello\" \u2603",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: copyright, registered, trademark",
        input: "\u00A9 \u00AE \u2122",
        expectedOutput: "(C) (R) (TM)",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
    {
        name: "Escape Smart Characters: non-breaking space",
        input: "hello\u00A0world",
        expectedOutput: "hello world",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Include"],
            },
        ],
    },
]);
