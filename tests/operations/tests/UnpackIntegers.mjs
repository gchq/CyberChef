/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Unpack Integers: issue example",
        "input": "01 22 43 fa 00 12 d6 87",
        "expectedOutput": "19022842, 1234567",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "32",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: signed",
        "input": "80 ff 00 7f",
        "expectedOutput": "-128, -1, 0, 127",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    true,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: unsigned",
        "input": "80 ff 00 7f",
        "expectedOutput": "128, 255, 0, 127",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: little endian",
        "input": "fa43220187d61200",
        "expectedOutput": "19022842|1234567",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "32",
                    false,
                    "|",
                    "Hex",
                    "Little endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: signed 64-bit",
        "input": "8000000000000000ffffffffffffffff7fffffffffffffff",
        "expectedOutput": "-9223372036854775808, -1, 9223372036854775807",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "64",
                    true,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: unsigned 64-bit",
        "input": "ffffffffffffffff",
        "expectedOutput": "18446744073709551615",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "64",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: empty",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "32",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: incomplete word",
        "input": "001122",
        "expectedOutput": "Input length must be a multiple of 4 bytes.",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "32",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: invalid hex 0",
        "input": "0",
        "expectedOutput": "Hex input must contain complete hexadecimal byte pairs separated only by whitespace.",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: invalid hex zz",
        "input": "zz",
        "expectedOutput": "Hex input must contain complete hexadecimal byte pairs separated only by whitespace.",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: invalid hex 00-11",
        "input": "00-11",
        "expectedOutput": "Hex input must contain complete hexadecimal byte pairs separated only by whitespace.",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: invalid hex 0x01",
        "input": "0x01",
        "expectedOutput": "Hex input must contain complete hexadecimal byte pairs separated only by whitespace.",
        "recipeConfig": [
            {
                "op": "Unpack Integers",
                "args": [
                    "8",
                    false,
                    ", ",
                    "Hex",
                    "Big endian"
                ]
            }
        ]
    },
    {
        "name": "Unpack Integers: raw round trip",
        "input": "-32768,32767,-1,0",
        "expectedOutput": "-32768,32767,-1,0",
        "recipeConfig": [
            {
                "op": "Pack Integers",
                "args": [
                    "16",
                    ",",
                    "Raw",
                    "Little endian"
                ]
            },
            {
                "op": "Unpack Integers",
                "args": [
                    "16",
                    true,
                    ",",
                    "Raw",
                    "Little endian"
                ]
            }
        ]
    }
]);
