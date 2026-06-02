/**
 * @author Louis-Ladd [lewisharshman1@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Remove ANSI Escape Codes: text using x1b escape code",
        "input": "\x1b[31mHello, \x1b[31mWorld!",
        "expectedOutput": "Hello, World!",
        "recipeConfig": [
            {
                "op": "Remove ANSI Escape Codes",
                "args": [
                ],
            },
        ],
    },
    {
        "name": "Remove ANSI Escape Codes: text with incomplete codes",
        "input": "\x1b[31 Hello, World!",
        "expectedOutput": "ello, World!",
        "recipeConfig": [
            {
                "op": "Remove ANSI Escape Codes",
                "args": [
                ],
            },
        ],
    },
    {
        "name": "Remove ANSI Escape Codes: cursor commands and clear screen",
        "input": "\x1b[2J\x1b[H\x1b[3BHello, World!",
        "expectedOutput": "Hello, World!",
        "recipeConfig": [
            {
                "op": "Remove ANSI Escape Codes",
                "args": [
                ],
            },
        ],
    },

    {
        "name": "Remove ANSI Escape Codes: text containing javascript escape representation of ansi escape codes",
        // input/output expressed in hex to avoid accidental interpretation of Javascript escapes and to make the test case explicit
        "input": "5c 30 33 33 5b 33 32 3b 31 3b 33 3b 34 3b 39 6d 48 65 6c 6c 6f 2c 20 5c 30 33 33 5b 33 32 3b 31 3b 33 3b 34 3b 39 6d 57 6f 72 6c 64 21",
        "expectedOutput": "5c 30 33 33 5b 33 32 3b 31 3b 33 3b 34 3b 39 6d 48 65 6c 6c 6f 2c 20 5c 30 33 33 5b 33 32 3b 31 3b 33 3b 34 3b 39 6d 57 6f 72 6c 64 21",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Remove ANSI Escape Codes",
                "args": []
            },
            {
                "op": "To Hex",
                "args": ["Space", 0]
            }
        ],
    },

]);
