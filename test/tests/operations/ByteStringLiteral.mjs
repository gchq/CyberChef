/**
 * Literal tests.
 *
 * @author edouard hinard []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Literal: python - empty",
        input: "",
        expectedOutput: "b''",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - single quote",
        input: "'",
        expectedOutput: "b\"'\"",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - single quote and data",
        input: "aaa'bbb",
        expectedOutput: "b\"aaa'bbb\"",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - double quote",
        input: "\"",
        expectedOutput: "b'\"'",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - double quote and data",
        input: "aaa\"bbb",
        expectedOutput: "b'aaa\"bbb'",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - single + double",
        input: "'\"",
        expectedOutput: "b'\\'\"'",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - double + single",
        input: "\"'",
        expectedOutput: "b'\"\\''",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - UTF-8 encoded string",
        input: "ça ma couté 20€",
        expectedOutput: "b'\\xc3\\xa7a ma cout\\xc3\\xa9 20\\xe2\\x82\\xac'",
        recipeConfig: [
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
    {
        name: "Literal: python - all 256 byte values",
        input: "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 40 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 4f 50 51 52 53 54 55 56 57 58 59 5a 5b 5c 5d 5e 5f 60 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 7b 7c 7d 7e 7f 80 81 82 83 84 85 86 87 88 89 8a 8b 8c 8d 8e 8f 90 91 92 93 94 95 96 97 98 99 9a 9b 9c 9d 9e 9f a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aa ab ac ad ae af b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 ba bb bc bd be bf c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 ca cb cc cd ce cf d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 da db dc dd de df e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 ea eb ec ed ee ef f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff",
        expectedOutput: "b'\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f !\"#$%&\\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\\x7f\\x80\\x81\\x82\\x83\\x84\\x85\\x86\\x87\\x88\\x89\\x8a\\x8b\\x8c\\x8d\\x8e\\x8f\\x90\\x91\\x92\\x93\\x94\\x95\\x96\\x97\\x98\\x99\\x9a\\x9b\\x9c\\x9d\\x9e\\x9f\\xa0\\xa1\\xa2\\xa3\\xa4\\xa5\\xa6\\xa7\\xa8\\xa9\\xaa\\xab\\xac\\xad\\xae\\xaf\\xb0\\xb1\\xb2\\xb3\\xb4\\xb5\\xb6\\xb7\\xb8\\xb9\\xba\\xbb\\xbc\\xbd\\xbe\\xbf\\xc0\\xc1\\xc2\\xc3\\xc4\\xc5\\xc6\\xc7\\xc8\\xc9\\xca\\xcb\\xcc\\xcd\\xce\\xcf\\xd0\\xd1\\xd2\\xd3\\xd4\\xd5\\xd6\\xd7\\xd8\\xd9\\xda\\xdb\\xdc\\xdd\\xde\\xdf\\xe0\\xe1\\xe2\\xe3\\xe4\\xe5\\xe6\\xe7\\xe8\\xe9\\xea\\xeb\\xec\\xed\\xee\\xef\\xf0\\xf1\\xf2\\xf3\\xf4\\xf5\\xf6\\xf7\\xf8\\xf9\\xfa\\xfb\\xfc\\xfd\\xfe\\xff'",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "To Byte String Literal",
                "args": ["python"]
            },
        ],
    },
]);
