/**
 * RC6 cipher tests.
 *
 * Test vectors from the IETF draft:
 * "Test Vectors for RC6 and RC5"
 * https://datatracker.ietf.org/doc/html/draft-krovetz-rc6-rc5-vectors-00
 *
 * Supports all word sizes: 8, 16, 32, 64, 128 bits.
 * Round-trip tests verify correct encryption/decryption behaviour.
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ============================================================
    // IETF TEST VECTORS - RC6-8/12/4 (8-bit words, 12 rounds, 4-byte key)
    // Block size: 4 bytes (32 bits)
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
    // IETF TEST VECTORS - RC6-16/16/8 (16-bit words, 16 rounds, 8-byte key)
    // Block size: 8 bytes (64 bits)
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
    // IETF TEST VECTORS - RC6-32/20/16 (32-bit words, 20 rounds, 16-byte key)
    // Block size: 16 bytes (128 bits) - Standard AES submission
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
    // IETF TEST VECTORS - RC6-64/24/24 (64-bit words, 24 rounds, 24-byte key)
    // Block size: 32 bytes (256 bits)
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
    // IETF TEST VECTORS - RC6-128/28/32 (128-bit words, 28 rounds, 32-byte key)
    // Block size: 64 bytes (512 bits)
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
    // ADDITIONAL RC6-32 TEST VECTORS (192-bit and 256-bit keys)
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
        name: "RC6-32/20/24: 192-bit key decrypt",
        input: "a68a14ff1342262a2bbd21f7966615eb",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
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
    {
        name: "RC6-32/20/32: 256-bit key decrypt",
        input: "921c3ecd43d9426a90089334d67aea2e",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // ZERO KEY/PLAINTEXT TEST (RC6-32/20/16)
    // ============================================================
    {
        name: "RC6-32/20: Zero Key/Plaintext encrypt",
        input: "00000000000000000000000000000000",
        expectedOutput: "8fc3a53656b1f778c129df4e9848a41e",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },
    {
        name: "RC6-32/20: Zero Key/Plaintext decrypt",
        input: "8fc3a53656b1f778c129df4e9848a41e",
        expectedOutput: "00000000000000000000000000000000",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // ROUND-TRIP TESTS - RC6-8 (8-bit words)
    // ============================================================
    {
        name: "RC6-8 Round-trip: ECB mode",
        input: "Test",
        expectedOutput: "Test",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 8, 12
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 8, 12
                ]
            }
        ]
    },
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

    // ============================================================
    // ROUND-TRIP TESTS - RC6-16 (16-bit words)
    // ============================================================
    {
        name: "RC6-16 Round-trip: ECB mode",
        input: "Testing!",
        expectedOutput: "Testing!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 16, 16
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 16, 16
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

    // ============================================================
    // ROUND-TRIP TESTS - RC6-32 (32-bit words, Standard)
    // ============================================================
    {
        name: "RC6-32 Round-trip: ECB 128-bit key",
        input: "Hello World!!!!",
        expectedOutput: "Hello World!!!!",
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
    },
    {
        name: "RC6-32 Round-trip: CBC 128-bit key",
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
        name: "RC6-32 Round-trip: CFB mode",
        input: "CFB mode test message",
        expectedOutput: "CFB mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CFB", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CFB", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    },
    {
        name: "RC6-32 Round-trip: OFB mode",
        input: "OFB mode test message",
        expectedOutput: "OFB mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    "OFB", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    "OFB", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    },
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
    {
        name: "RC6-32 Round-trip: UTF8 key",
        input: "Secret message",
        expectedOutput: "Secret message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "mypassword123456", option: "UTF8" },
                    { string: "initialisevec123", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "mypassword123456", option: "UTF8" },
                    { string: "initialisevec123", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    },

    // ============================================================
    // ROUND-TRIP TESTS - RC6-64 (64-bit words)
    // ============================================================
    {
        name: "RC6-64 Round-trip: ECB mode",
        input: "Testing 64-bit word size!!!!!!!",
        expectedOutput: "Testing 64-bit word size!!!!!!!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 64, 24
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 64, 24
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

    // ============================================================
    // RC6-128 ROUND-TRIP TESTS (128-bit words, 64-byte block size)
    // ============================================================
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
    {
        name: "RC6-128 Round-trip: CBC mode",
        input: "RC6-128 with CBC mode needs a 64-byte IV for proper operation with large blocks!",
        expectedOutput: "RC6-128 with CBC mode needs a 64-byte IV for proper operation with large blocks!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5", 128, 28
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5", 128, 28
                ]
            }
        ]
    },

    // ============================================================
    // CUSTOM ROUND TESTS - Verify non-standard rounds work
    // ============================================================
    {
        name: "RC6-32 Round-trip: Custom 8 rounds",
        input: "Testing 8 rounds",
        expectedOutput: "Testing 8 rounds",
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
    {
        name: "RC6-32 Round-trip: Custom 12 rounds",
        input: "Testing 12 rounds",
        expectedOutput: "Testing 12 rounds",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 32, 12
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 32, 12
                ]
            }
        ]
    },
    {
        name: "RC6-32 Round-trip: Custom 32 rounds",
        input: "Testing 32 rounds",
        expectedOutput: "Testing 32 rounds",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 32, 32
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 32, 32
                ]
            }
        ]
    },
    {
        name: "RC6-8 Round-trip: Custom 20 rounds",
        input: "8-bit with 20 rounds",
        expectedOutput: "8-bit with 20 rounds",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", 8, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", 8, 20
                ]
            }
        ]
    },
    {
        name: "RC6-16 Round-trip: Custom 24 rounds",
        input: "16-bit with 24 rounds",
        expectedOutput: "16-bit with 24 rounds",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5", "16", 24
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5", "16", 24
                ]
            }
        ]
    },

    // ============================================================
    // EDGE CASE TESTS - Various input lengths
    // ============================================================
    {
        name: "RC6-32 Round-trip: 1 byte input",
        input: "A",
        expectedOutput: "A",
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
    },
    {
        name: "RC6-32 Round-trip: 15 byte input",
        input: "123456789012345",
        expectedOutput: "123456789012345",
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
    },
    {
        name: "RC6-32 Round-trip: 16 byte input (exact block)",
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
    },
    {
        name: "RC6-32 Round-trip: 17 byte input",
        input: "12345678901234567",
        expectedOutput: "12345678901234567",
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
    },
    {
        name: "RC6-32 Round-trip: Binary data",
        input: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        expectedOutput: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5", 32, 20
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5", 32, 20
                ]
            }
        ]
    }
]);
