/**
 * Text-Integer Conversion tests.
 *
 * @author p-leriche [philip.leriche@cantab.net]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Text-Integer Conversion quoted string to decimal",
        input: "\"ABC\"",
        expectedOutput: "4276803",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion quoted string to hexadecimal",
        input: "\"ABC\"",
        expectedOutput: "0x414243",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Hexadecimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion single quoted string to decimal",
        input: "'Hello'",
        expectedOutput: "310939249775",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion decimal to string",
        input: "4276803",
        expectedOutput: "ABC",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion hexadecimal to string",
        input: "0x48656C6C6F",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion round-trip string.decimal.string",
        input: "\"Test\"",
        expectedOutput: "Test",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion round-trip string.hex.string",
        input: "\"CyberChef\"",
        expectedOutput: "CyberChef",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Hexadecimal"],
            },
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion implicit round trip string-string Latin-1",
        input: "U+00FF",
        expectedOutput: "U+00FF",  // U+00FF (Latin small letter y with diaeresis)
        recipeConfig: [
            {
                op: "Unescape Unicode Characters",
                args: ["U+"],
            },
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
            {
                op: "Escape Unicode Characters",
                args: ["U+", false, 4, true],
            },
        ],
    },
    {
        name: "Text-Integer Conversion unquoted text to decimal",
        input: "Hi",
        expectedOutput: "18537",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion single character",
        input: "\"A\"",
        expectedOutput: "65",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion hex to decimal conversion",
        input: "0xFF",
        expectedOutput: "255",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion decimal to hex conversion",
        input: "255",
        expectedOutput: "0xff",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Hexadecimal"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion large number to string",
        input: "113091951015816448506195587157728348242683688608116",
        expectedOutput: "Mary had a little cat",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["String"],
            },
        ],
    },
    {
        name: "Text-Integer Conversion whitespace handling (quoted)",
        input: "\"  test  \"",
        expectedOutput: "2314978187545944096",
        recipeConfig: [
            {
                op: "Text-Integer Conversion",
                args: ["Decimal"],
            },
        ],
    },
]);
