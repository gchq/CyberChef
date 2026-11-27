/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Pack Integers: issue example",
        "input": "19022842, 1234567",
        "expectedOutput": "01 22 43 fa 00 12 d6 87",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "32",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: little endian",
        "input": "19022842, 1234567",
        "expectedOutput": "fa 43 22 01 87 d6 12 00",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "32",
                    ",",
                    "Hex",
                    "Little endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: signed bounds",
        "input": "-128,-1,0,127,255",
        "expectedOutput": "80 ff 00 7f ff",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: unsigned 64-bit precision",
        "input": "18446744073709551615,9007199254740993",
        "expectedOutput": "ff ff ff ff ff ff ff ff 00 20 00 00 00 00 00 01",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "64",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: custom 24-bit width",
        "input": "16777215,-8388608",
        "expectedOutput": "ff ff ff 80 00 00",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "24",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: literal separator",
        "input": "1||2",
        "expectedOutput": "00 01 00 02",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "16",
                    "||",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: hex input integers",
        "input": "0x012243fa, 0x12d687",
        "expectedOutput": "01 22 43 fa 00 12 d6 87",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "32",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: empty",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "32",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: zero bytes preserved",
        "input": "0,255",
        "expectedOutput": "00 ff",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Raw",
                    "Big endian"
                ]
            },
            {
                "op": "To Hex",
                "args": [
                    "Space",
                    0
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size 0",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "0",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size 7",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "7",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size 12",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "12",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size 4097",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "4097",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size Infinity",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "Infinity",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size NaN",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "NaN",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size abc",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "abc",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid size ",
        "input": "1",
        "expectedOutput": "Size in bits must be a multiple of 8 from 8 to 4096.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: overflow 256",
        "input": "256",
        "expectedOutput": "Integer at position 1 does not fit in 8 bits.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: overflow -129",
        "input": "-129",
        "expectedOutput": "Integer at position 1 does not fit in 8 bits.",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid integer 1.5",
        "input": "1.5",
        "expectedOutput": "Integer at position 1 must be decimal or hex (0x...)",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid integer 1e3",
        "input": "1e3",
        "expectedOutput": "Integer at position 1 must be decimal or hex (0x...)",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid integer 1x",
        "input": "1x",
        "expectedOutput": "Integer at position 1 must be decimal or hex (0x...)",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid integer ,1",
        "input": ",1",
        "expectedOutput": "Integer at position 1 must be decimal or hex (0x...)",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Pack Integers: invalid integer 1,",
        "input": "1,",
        "expectedOutput": "Integer at position 2 must be decimal or hex (0x...)",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "8",
                    ",",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    }
]);
