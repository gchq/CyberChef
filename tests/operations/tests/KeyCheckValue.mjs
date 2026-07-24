/**
 * @author J8k3 [https://jacobmarks.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// TDES-ECB (Zeros) — key from NIST SP 800-67 Rev 2 §B.1, "Numerical Example for TDEA".
// AES-ECB (Zeros) and AES-CMAC (Empty) — key from NIST SP 800-38B "Recommendation for
// Block Cipher Modes of Operation: The CMAC Mode for Authentication", Appendix D.1
// (also RFC 4493 §4). The AES-CMAC empty-message MAC 0xbb1d6929e95937287fa37d129b756746
// is corroborated by the existing "CMAC-AES128 NIST's CSRC Example #1" test.

TestRegister.addTests([
    {
        "name": "Key Check Value: TDES-ECB (Zeros), NIST SP 800-67 key",
        "input": "0123456789ABCDEF23456789ABCDEF01456789ABCDEF0123",
        "expectedOutput": "4EBA73",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "0123456789ABCDEF23456789ABCDEF01456789ABCDEF0123"}, "TDES-ECB (Zeros)", 6]
            }
        ]
    },
    {
        "name": "Key Check Value: TDES-ECB (Zeros), double-length 16-byte key expanded to k1||k2||k1",
        "input": "0123456789ABCDEF23456789ABCDEF01",
        "expectedOutput": "86E965",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "0123456789ABCDEF23456789ABCDEF01"}, "TDES-ECB (Zeros)", 6]
            }
        ]
    },
    {
        "name": "Key Check Value: AES-ECB (Zeros), NIST SP 800-38B AES-128 key",
        "input": "2b7e151628aed2a6abf7158809cf4f3c",
        "expectedOutput": "7DF76B",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "2b7e151628aed2a6abf7158809cf4f3c"}, "AES-ECB (Zeros)", 6]
            }
        ]
    },
    {
        "name": "Key Check Value: AES-CMAC (Empty), NIST SP 800-38B AES-128 key",
        "input": "2b7e151628aed2a6abf7158809cf4f3c",
        "expectedOutput": "BB1D69",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "2b7e151628aed2a6abf7158809cf4f3c"}, "AES-CMAC (Empty)", 6]
            }
        ]
    },
    {
        "name": "Key Check Value: output length respects hex-char argument",
        "input": "2b7e151628aed2a6abf7158809cf4f3c",
        "expectedOutput": "BB1D6929",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "2b7e151628aed2a6abf7158809cf4f3c"}, "AES-CMAC (Empty)", 8]
            }
        ]
    },
    {
        "name": "Key Check Value: empty key rejected",
        "input": "",
        "expectedOutput": "No key material was provided.",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": ""}, "AES-CMAC (Empty)", 6]
            }
        ]
    },
    {
        "name": "Key Check Value: invalid TDES key length rejected",
        "input": "0123456789ABCDEF",
        "expectedOutput": "TDES key must be 16 or 24 bytes (currently 8 bytes).",
        "recipeConfig": [
            {
                "op": "Key Check Value",
                "args": [{"option": "Hex", "string": "0123456789ABCDEF"}, "TDES-ECB (Zeros)", 6]
            }
        ]
    }
]);
