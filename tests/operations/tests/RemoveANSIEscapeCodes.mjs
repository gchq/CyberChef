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
    }
]);
