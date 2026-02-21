/**
 * @author aosterhage [aaron.osterhage@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "AES Key Wrap With Padding: RFC Test Vector, 20 octets data, 192-bit KEK",
        "input": "c37b7e6492584340bed12207808941155068f738",
        "expectedOutput": "138bdeaa9b8fa7fc61f97742e72248ee5ae6ae5360d1ae6a5f54f373fa543b6a",
        "recipeConfig": [
            {
                "op": "AES Key Wrap With Padding",
                "args": [
                    {"option": "Hex", "string": "5840df6e29b02af1ab493b705bf16ea1ae8338f4dcc176a8"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Wrap With Padding: RFC Test Vector, 7 octets data, 192-bit KEK",
        "input": "466f7250617369",
        "expectedOutput": "afbeb0f07dfbf5419200f2ccb50bb24f",
        "recipeConfig": [
            {
                "op": "AES Key Wrap With Padding",
                "args": [
                    {"option": "Hex", "string": "5840df6e29b02af1ab493b705bf16ea1ae8338f4dcc176a8"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Wrap With Padding: invalid KEK length",
        "input": "00112233445566778899aabbccddeeff",
        "expectedOutput": "KEK must be either 16, 24, or 32 bytes (currently 10 bytes)",
        "recipeConfig": [
            {
                "op": "AES Key Wrap With Padding",
                "args": [
                    {"option": "Hex", "string": "00010203040506070809"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Wrap With Padding: input too short",
        "input": "",
        "expectedOutput": "input must be > 0 bytes",
        "recipeConfig": [
            {
                "op": "AES Key Wrap With Padding",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Unwrap With Padding: RFC Test Vector, 20 octets data, 192-bit KEK",
        "input": "138bdeaa9b8fa7fc61f97742e72248ee5ae6ae5360d1ae6a5f54f373fa543b6a",
        "expectedOutput": "c37b7e6492584340bed12207808941155068f738",
        "recipeConfig": [
            {
                "op": "AES Key Unwrap With Padding",
                "args": [
                    {"option": "Hex", "string": "5840df6e29b02af1ab493b705bf16ea1ae8338f4dcc176a8"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Unwrap With Padding: RFC Test Vector, 7 octets data, 192-bit KEK",
        "input": "afbeb0f07dfbf5419200f2ccb50bb24f",
        "expectedOutput": "466f7250617369",
        "recipeConfig": [
            {
                "op": "AES Key Unwrap With Padding",
                "args": [
                    {"option": "Hex", "string": "5840df6e29b02af1ab493b705bf16ea1ae8338f4dcc176a8"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Unwrap With Padding: invalid KEK length",
        "input": "1fa68b0a8112b447aef34bd8fb5a7b829d3e862371d2cfe5",
        "expectedOutput": "KEK must be either 16, 24, or 32 bytes (currently 10 bytes)",
        "recipeConfig": [
            {
                "op": "AES Key Unwrap With Padding",
                "args": [
                    {"option": "Hex", "string": "00010203040506070809"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Unwrap With Padding: input length not multiple of 8",
        "input": "1fa68b0a8112b447aef34bd8fb5a7b829d3e862371d2cfe5e621",
        "expectedOutput": "input must be 8n (n>=2) bytes (currently 26 bytes)",
        "recipeConfig": [
            {
                "op": "AES Key Unwrap With Padding",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
    {
        "name": "AES Key Unwrap With Padding: input too short",
        "input": "1fa68b0a8112b447",
        "expectedOutput": "input must be 8n (n>=2) bytes (currently 8 bytes)",
        "recipeConfig": [
            {
                "op": "AES Key Unwrap With Padding",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    "Hex", "Hex"
                ],
            },
        ],
    },
]);
