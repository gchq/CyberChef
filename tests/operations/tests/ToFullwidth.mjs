/**
 * To Fullwidth tests.
 *
 * @author jyeu [chen@jyeu.xyz]
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Fullwidth: empty string",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: lowercase letters",
        input: "admin",
        expectedOutput: "\uFF41\uFF44\uFF4D\uFF49\uFF4E",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: uppercase letters",
        input: "ADMIN",
        expectedOutput: "\uFF21\uFF24\uFF2D\uFF29\uFF2E",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: digits",
        input: "0123456789",
        expectedOutput: "\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: space becomes ideographic space (U+3000)",
        input: "hello world",
        expectedOutput: "\uFF48\uFF45\uFF4C\uFF4C\uFF4F\u3000\uFF57\uFF4F\uFF52\uFF4C\uFF44",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: common punctuation and symbols",
        input: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
        expectedOutput: "\uFF01\uFF20\uFF03\uFF04\uFF05\uFF3E\uFF06\uFF0A\uFF08\uFF09\uFF3F\uFF0B\uFF0D\uFF1D\uFF3B\uFF3D\uFF5B\uFF5D\uFF5C\uFF1B\uFF07\uFF1A\uFF02\uFF0C\uFF0E\uFF0F\uFF1C\uFF1E\uFF1F",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: slash for WAF bypass simulation",
        input: "/admin/secret",
        expectedOutput: "\uFF0F\uFF41\uFF44\uFF4D\uFF49\uFF4E\uFF0F\uFF53\uFF45\uFF43\uFF52\uFF45\uFF54",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: non-ASCII characters pass through unchanged",
        input: "你好世界",
        expectedOutput: "你好世界",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: newline passes through unchanged",
        input: "line1\nline2",
        expectedOutput: "\uFF4C\uFF49\uFF4E\uFF45\uFF11\n\uFF4C\uFF49\uFF4E\uFF45\uFF12",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: mixed ASCII and non-ASCII",
        input: "hello,世界!",
        expectedOutput: "\uFF48\uFF45\uFF4C\uFF4C\uFF4F\uFF0C世界\uFF01",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: boundary character 0x21 (!)",
        input: "!",
        expectedOutput: "\uFF01",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
    {
        name: "To Fullwidth: boundary character 0x7E (~)",
        input: "~",
        expectedOutput: "\uFF5E",
        recipeConfig: [
            {
                op: "To Fullwidth",
                args: [],
            },
        ],
    },
]);
