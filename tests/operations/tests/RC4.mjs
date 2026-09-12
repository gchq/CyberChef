/**
 * RC4 tests.
 *
 * @author Stuart Wilson
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "RC4: Hex passphrase, clean hex (1f10)",
        "input": "test",
        "expectedOutput": "8aee3802",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "1f10"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: Hex passphrase, comma-delimited (1f,10) equals clean hex",
        "input": "test",
        "expectedOutput": "8aee3802",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "1f,10"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: Hex passphrase, 0x-prefixed (0x1f,0x10) equals clean hex",
        "input": "test",
        "expectedOutput": "8aee3802",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "0x1f,0x10"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: Hex passphrase, space-delimited (1f 10) equals clean hex",
        "input": "test",
        "expectedOutput": "8aee3802",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "1f 10"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: Hex passphrase, colon-delimited uppercase (1F:10) equals clean hex",
        "input": "test",
        "expectedOutput": "8aee3802",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "1F:10"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: invalid hex character in passphrase shows error in output",
        "input": "test",
        "expectedOutput": "Invalid character 'G' in Hex input. Hex accepts 0-9, a-f, A-F, and delimiters (space, comma, colon, 0x prefix).",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "Hex", "string": "1fG0"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4: UTF8 passphrase still works",
        "input": "test",
        "expectedOutput": "8b904b7a",
        "recipeConfig": [
            {
                "op": "RC4",
                "args": [
                    {"option": "UTF8", "string": "password"},
                    "Latin1",
                    "Hex"
                ]
            }
        ]
    },
    {
        "name": "RC4 Drop: Hex passphrase, comma-delimited (1f,10) equals clean hex",
        "input": "test",
        "expectedOutput": "47055271",
        "recipeConfig": [
            {
                "op": "RC4 Drop",
                "args": [
                    {"option": "Hex", "string": "1f,10"},
                    "Latin1",
                    "Hex",
                    192
                ]
            }
        ]
    },
    {
        "name": "RC4 Drop: Hex passphrase, 0x-prefixed equals clean hex",
        "input": "test",
        "expectedOutput": "47055271",
        "recipeConfig": [
            {
                "op": "RC4 Drop",
                "args": [
                    {"option": "Hex", "string": "0x1f,0x10"},
                    "Latin1",
                    "Hex",
                    192
                ]
            }
        ]
    }
]);
