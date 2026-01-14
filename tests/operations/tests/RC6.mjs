/**
 * RC6 cipher tests.
 *
 * Test vectors from the IETF draft:
 * "Test Vectors for RC6 and RC5"
 * https://datatracker.ietf.org/doc/html/draft-krovetz-rc6-rc5-vectors-00
 *
 * Note: PKCS5 padding adds an extra block when input is exactly block-aligned.
 * Round-trip tests verify correct encryption/decryption behavior.
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ============================================================
    // OFFICIAL TEST VECTORS from IETF draft-krovetz-rc6-rc5-vectors-00
    // RC6-32/20/16 (128-bit key)
    // ============================================================
    {
        name: "RC6 Official Vector 1: 128-bit key (IETF draft)",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "3a96f9c7f6755cfe46f00e3dcd5d2a3c",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "RC6 Official Vector 1 Decrypt: 128-bit key",
        input: "3a96f9c7f6755cfe46f00e3dcd5d2a3c",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // RC6-32/20/24 (192-bit key) - Self-generated, verified by independent implementations
    {
        name: "RC6 192-bit key encrypt",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "a68a14ff1342262a2bbd21f7966615eb",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "RC6 192-bit key decrypt",
        input: "a68a14ff1342262a2bbd21f7966615eb",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // RC6-32/20/32 (256-bit key) - Self-generated, verified by independent implementations
    {
        name: "RC6 256-bit key encrypt",
        input: "000102030405060708090a0b0c0d0e0f",
        expectedOutput: "921c3ecd43d9426a90089334d67aea2e",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "RC6 256-bit key decrypt",
        input: "921c3ecd43d9426a90089334d67aea2e",
        expectedOutput: "000102030405060708090a0b0c0d0e0f",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // Zero key, zero plaintext test
    {
        name: "RC6 Zero Key/Plaintext: 128-bit key",
        input: "00000000000000000000000000000000",
        expectedOutput: "8fc3a53656b1f778c129df4e9848a41e",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "RC6 Zero Key/Plaintext Decrypt: 128-bit key",
        input: "8fc3a53656b1f778c129df4e9848a41e",
        expectedOutput: "00000000000000000000000000000000",
        recipeConfig: [
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // ============================================================
    // Round-trip tests - These verify encryption and decryption work correctly
    // ============================================================
    {
        name: "RC6 Round-trip: ECB 128-bit key, short message",
        input: "Hello World!!!!",
        expectedOutput: "Hello World!!!!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: CBC 128-bit key, long message",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: ECB 192-bit key",
        input: "Testing RC6 cipher with 192-bit key",
        expectedOutput: "Testing RC6 cipher with 192-bit key",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff0011223344556677", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: CBC 256-bit key",
        input: "RC6 is a symmetric block cipher designed by Ron Rivest!",
        expectedOutput: "RC6 is a symmetric block cipher designed by Ron Rivest!",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "8877665544332211ffeeddccbbaa9988", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "8877665544332211ffeeddccbbaa9988", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: UTF8 key (16 bytes)",
        input: "Secret message",
        expectedOutput: "Secret message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "mypassword123456", option: "UTF8" },
                    { string: "initializevec123", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "mypassword123456", option: "UTF8" },
                    { string: "initializevec123", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    // CFB mode tests
    {
        name: "RC6 Round-trip: CFB mode",
        input: "CFB mode test message",
        expectedOutput: "CFB mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CFB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CFB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    // OFB mode tests
    {
        name: "RC6 Round-trip: OFB mode",
        input: "OFB mode test message",
        expectedOutput: "OFB mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    "OFB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "aabbccddeeff00112233445566778899", option: "Hex" },
                    "OFB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    // CTR mode tests
    {
        name: "RC6 Round-trip: CTR mode",
        input: "CTR mode test message",
        expectedOutput: "CTR mode test message",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    // Edge case tests - various input lengths
    {
        name: "RC6 Round-trip: Various lengths 1 byte",
        input: "A",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: Various lengths 15 bytes",
        input: "123456789012345",
        expectedOutput: "123456789012345",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: Various lengths 16 bytes (exact block)",
        input: "1234567890123456",
        expectedOutput: "1234567890123456",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: Various lengths 17 bytes",
        input: "12345678901234567",
        expectedOutput: "12345678901234567",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: Various lengths 32 bytes (two blocks)",
        input: "12345678901234567890123456789012",
        expectedOutput: "12345678901234567890123456789012",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "RC6 Round-trip: Binary data",
        input: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        expectedOutput: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        recipeConfig: [
            {
                op: "RC6 Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "RC6 Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    }
]);
