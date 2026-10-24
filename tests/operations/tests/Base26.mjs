/**
 * Base26 tests.
 *
 * @author NOVA-Openclaw
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Base26: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26: EAT -> JYGBS",
        input: "EAT",
        expectedOutput: "JYGBS",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26: Hello, World!",
        input: "Hello, World!",
        expectedOutput: "LBVLPVLUNRXHXRHSZIHQLL",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26: UTF-8",
        input: "ნუ პანიკას",
        expectedOutput: "HLPHPKXWXPTREJHEBQENHKRQAKLFKOWIWEXTDNAOPRQFRQLL",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26: zero byte",
        input: "\x00",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26: binary",
        input: "\x01\x02\x03",
        expectedOutput: "DTSL",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
        ],
    },
    {
        name: "From Base26: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base26",
                args: [],
            },
        ],
    },
    {
        name: "From Base26: JYGBS -> EAT",
        input: "JYGBS",
        expectedOutput: "EAT",
        recipeConfig: [
            {
                op: "From Base26",
                args: [],
            },
        ],
    },
    {
        name: "From Base26: lowercase and ignored characters",
        input: "j y-g!b@s",
        expectedOutput: "EAT",
        recipeConfig: [
            {
                op: "From Base26",
                args: [],
            },
        ],
    },
    {
        name: "From Base26: A -> zero byte",
        input: "A",
        expectedOutput: "\x00",
        recipeConfig: [
            {
                op: "From Base26",
                args: [],
            },
        ],
    },
    {
        name: "From Base26: DTSL -> binary",
        input: "DTSL",
        expectedOutput: "\x01\x02\x03",
        recipeConfig: [
            {
                op: "From Base26",
                args: [],
            },
        ],
    },
    {
        name: "To Base26 round-trip",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                op: "To Base26",
                args: [],
            },
            {
                op: "From Base26",
                args: [],
            },
        ],
    }
]);
