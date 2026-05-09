/**
 * Parity Bit tests
 *
 * @author j83305 [awz22@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parity bit encode in even parity, 1 block of binary of arbitrary length, prepend, even number of 1s",
        input: "01010101 10101010",
        expectedOutput: "001010101 10101010",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Even Parity",
                    "Start",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in even parity, 1 block of binary of arbitrary length, prepend, odd number of 1s",
        input: "01010101 10101011",
        expectedOutput: "101010101 10101011",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Even Parity",
                    "Start",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in even parity, 1 block of binary of arbitrary length, append, odd number of 1s",
        input: "01010101 10101011",
        expectedOutput: "01010101 101010111",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Even Parity",
                    "End",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in odd parity, 1 block of binary of arbitrary length, prepend, even number of 1s",
        input: "01010101 10101010",
        expectedOutput: "101010101 10101010",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Odd Parity",
                    "Start",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in odd parity, 1 block of binary of arbitrary length, prepend, odd number of 1s",
        input: "01010101 10101011",
        expectedOutput: "001010101 10101011",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Odd Parity",
                    "Start",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in odd parity, 1 block of binary of arbitrary length, append, odd number of 1s",
        input: "01010101 10101011",
        expectedOutput: "01010101 101010110",
        recipeConfig: [
            {
                "op": "Parity Bit",
                "args": [
                    "Odd Parity",
                    "End",
                    "Encode",
                    ""
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in even parity, binary for 'hello world!', prepend to each byte",
        input: "hello world!",
        expectedOutput: "101101000 001100101 001101100 001101100 001101111 100100000 001110111 001101111 001110010 001101100 101100100 000100001",
        recipeConfig: [
            {
                "op": "To Binary",
                "args": ["Space"]
            },
            {
                "op": "Parity Bit",
                "args": [
                    "Even Parity",
                    "Start",
                    "Encode",
                    " "
                ]
            }
        ]
    },
    {
        name: "Parity bit encode in odd parity, binary for 'hello world!', append to each byte",
        input: "hello world!",
        expectedOutput: "011010000 011001011 011011001 011011001 011011111 001000000 011101111 011011111 011100101 011011001 011001000 001000011",
        recipeConfig: [
            {
                "op": "To Binary",
                "args": ["Space"]
            },
            {
                "op": "Parity Bit",
                "args": [
                    "Odd Parity",
                    "End",
                    "Encode",
                    " "
                ]
            }
        ]
    },
]);
