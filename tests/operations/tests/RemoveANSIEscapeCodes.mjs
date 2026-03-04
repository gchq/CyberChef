/**
 * @author Louis-Ladd [lewisharshman1@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Remove ANSI Escape Codes: x1b escape code",
        "input": "\\x1b[31;1;3;4;9mHello, \\x1b[31;1;3;4;9mWorld!",
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
        "name": "Remove ANSI Escape Codes: 033 escape code",
        "input": "\\033[32;1;3;4;9mHello, \\033[32;1;3;4;9mWorld!",
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
        "name": "Remove ANSI Escape Codes: e escape code",
        "input": "\\e[32;1;3;4;9mHello, \\e[32;1;3;4;9mWorld!",
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
