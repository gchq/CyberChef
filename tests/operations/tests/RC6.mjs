/**
 * RC6 cipher tests.
 *
 * Test vectors from the IETF draft:
 * "Test Vectors for RC6 and RC5"
 * https://datatracker.ietf.org/doc/html/draft-krovetz-rc6-rc5-vectors-00
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ============================================================
    // IETF TEST VECTORS - RC6-8/12/4
    // ============================================================
    {
        name: "RC6-8/12/4: IETF vector encrypt",
        input: "00010203",
        expectedOutput: "aefc4612",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00010203", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 8, 12
                ]
            }
        ]
    },
    {
        name: "RC6-8/12/4: IETF vector decrypt",
        input: "aefc4612",
        expectedOutput: "00010203",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00010203", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 8, 12
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-16/16/8
    // ============================================================
    {
        name: "RC6-16/16/8: IETF vector encrypt",
        input: "0001020304050607",
        expectedOutput: "2ff0b68eaeffad5b",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "0001020304050607", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 16, 16
                ]
            }
        ]
    },
    {
        name: "RC6-16/16/8: IETF vector decrypt",
        input: "2ff0b68eaeffad5b",
        expectedOutput: "0001020304050607",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "0001020304050607", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 16, 16
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-32/20/16 (AES standard)
    // ============================================================
    {
        name: "RC6-32/20/16: IETF vector encrypt (AES standard)",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "3a96f9c7f6755cfe46f00e3dcd5d2a3c",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },
    {
        name: "RC6-32/20/16: IETF vector decrypt (AES standard)",
        input: "3a96f9c7f6755cfe46f00e3dcd5d2a3c",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-64/24/24
    // ============================================================
    {
        name: "RC6-64/24/24: IETF vector encrypt",
        input: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        expectedOutput: "c002de050bd55e5d36864ab9853338e6dc4a1326c6bdaaeb1bc9e4fd67886617",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 64, 24
                ]
            }
        ]
    },
    {
        name: "RC6-64/24/24: IETF vector decrypt",
        input: "c002de050bd55e5d36864ab9853338e6dc4a1326c6bdaaeb1bc9e4fd67886617",
        expectedOutput: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 64, 24
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-128/28/32
    // ============================================================
    {
        name: "RC6-128/28/32: IETF vector encrypt",
        input: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        expectedOutput: "4ed87c64baffecd4303ee6a79aafaef575b351c024272be70a70b4a392cfc157dba52d529a79e83845bf43d67545383aed3dbf4f0d23640e44cbf6cdaa034dcb",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 128, 28
                ]
            }
        ]
    },
    {
        name: "RC6-128/28/32: IETF vector decrypt",
        input: "4ed87c64baffecd4303ee6a79aafaef575b351c024272be70a70b4a392cfc157dba52d529a79e83845bf43d67545383aed3dbf4f0d23640e44cbf6cdaa034dcb",
        expectedOutput: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 128, 28
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-24/4/0 (non-power-of-2)
    // ============================================================
    {
        name: "RC6-24/4/0: IETF non-standard vector encrypt (w=24, empty key)",
        input: "000102030405060708090a0b",
        expectedOutput: "0177982579be2ee3303269b9",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 24, 4
                ]
            }
        ]
    },
    {
        name: "RC6-24/4/0: IETF non-standard vector decrypt (w=24, empty key)",
        input: "0177982579be2ee3303269b9",
        expectedOutput: "000102030405060708090a0b",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 24, 4
                ]
            }
        ]
    },

    // ============================================================
    // IETF TEST VECTORS - RC6-80/4/12 (non-power-of-2)
    // ============================================================
    {
        name: "RC6-80/4/12: IETF non-standard vector encrypt (w=80)",
        input: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021222324252627",
        expectedOutput: "26d9d6128601d06dec3817d401f1c0ff715473543875da417c2116d1e87c919a49311b00b4e17962",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 80, 4
                ]
            }
        ]
    },
    {
        name: "RC6-80/4/12: IETF non-standard vector decrypt (w=80)",
        input: "26d9d6128601d06dec3817d401f1c0ff715473543875da417c2116d1e87c919a49311b00b4e17962",
        expectedOutput: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f2021222324252627",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 80, 4
                ]
            }
        ]
    },

    // ============================================================
    // ADDITIONAL KEY SIZE TESTS - RC6-32 (192-bit and 256-bit keys)
    // ============================================================
    {
        name: "RC6-32/20/24: 192-bit key encrypt",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "a68a14ff1342262a2bbd21f7966615eb",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },
    {
        name: "RC6-32/20/32: 256-bit key encrypt",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "921c3ecd43d9426a90089334d67aea2e",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // ROUND-TRIP TESTS - One per word size to verify encrypt/decrypt
    // ============================================================
    {
        name: "RC6-8 Round-trip: CBC mode",
        input: "Hello World!",
        expectedOutput: "Hello World!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "mysecret", option: "UTF8" },
                    { string: "abcd", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5", 8, 12
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "mysecret", option: "UTF8" },
                    { string: "abcd", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5", 8, 12
                ]
            }
        ]
    },
    {
        name: "RC6-16 Round-trip: CBC mode",
        input: "The quick brown fox",
        expectedOutput: "The quick brown fox",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "secretkey1234567", option: "UTF8" },
                    { string: "initvec!", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5", 16, 16
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "secretkey1234567", option: "UTF8" },
                    { string: "initvec!", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5", 16, 16
                ]
            }
        ]
    },
    {
        name: "RC6-32 Round-trip: CBC mode",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    },
    {
        name: "RC6-64 Round-trip: CBC mode",
        input: "RC6 with 64-bit words is powerful!",
        expectedOutput: "RC6 with 64-bit words is powerful!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5", 64, 24
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5", 64, 24
                ]
            }
        ]
    },
    {
        name: "RC6-128 Round-trip: ECB mode",
        input: "RC6 with 128-bit words provides massive block size for testing purposes!",
        expectedOutput: "RC6 with 128-bit words provides massive block size for testing purposes!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 128, 28
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 128, 28
                ]
            }
        ]
    },

    // ============================================================
    // STREAM MODES TEST - Verify CFB/OFB/CTR work correctly
    // ============================================================
    {
        name: "RC6-32 Round-trip: CTR mode",
        input: "CTR mode test message",
        expectedOutput: "CTR mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // CUSTOM ROUNDS TEST - Verify non-standard round count works
    // ============================================================
    {
        name: "RC6-32 Round-trip: Custom 8 rounds",
        input: "Testing custom rounds",
        expectedOutput: "Testing custom rounds",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 32, 8
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 32, 8
                ]
            }
        ]
    },

    // ============================================================
    // EDGE CASE TEST - Padding boundary
    // ============================================================
    {
        name: "RC6-32 Round-trip: Exact block size input",
        input: "1234567890123456",
        expectedOutput: "1234567890123456",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    }
]);
