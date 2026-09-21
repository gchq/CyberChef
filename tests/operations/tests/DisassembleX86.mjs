/**
 * Disassemble x86 tests.
 *
 * @author arjun2075
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Disassemble x86: default code segment is unchanged",
        input: "90",
        expectedMatch: /0016:0000\s+NOP/,
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "16", "0", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: hex code segment with 0x prefix",
        input: "90",
        expectedMatch: /0ABC:0000\s+NOP/,
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "0xABC", "0", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: hex code segment with h suffix",
        input: "90",
        expectedMatch: /0ABC:0000\s+NOP/,
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "ABCh", "0", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: bare hex code segment",
        input: "90",
        expectedMatch: /0ABC:0000\s+NOP/,
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "ABC", "0", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: hex offset with 0x prefix",
        input: "90",
        expectedMatch: /0016:1000\s+NOP/,
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "16", "0x1000", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: invalid code segment is rejected",
        input: "90",
        expectedOutput: "Invalid Code Segment (CS): 'wibble' is not a hexadecimal number.",
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "wibble", "0", false, true],
            },
        ],
    },
    {
        name: "Disassemble x86: invalid offset is rejected",
        input: "90",
        expectedOutput: "Invalid Offset (IP): 'wibble' is not a hexadecimal number.",
        recipeConfig: [
            {
                op: "Disassemble x86",
                args: ["16", "Full x86 architecture", "16", "wibble", false, true],
            },
        ],
    },
]);
