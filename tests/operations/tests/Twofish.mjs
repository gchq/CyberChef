/**
 * Twofish cipher tests.
 *
 * Test vectors from the official Twofish paper:
 * https://www.schneier.com/academic/twofish/
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
    // OFFICIAL TEST VECTORS from Bruce Schneier's Twofish paper:
    // https://www.schneier.com/academic/twofish/
    // https://www.schneier.com/wp-content/uploads/2015/12/ecb_ival.txt
    // ============================================================
    {
        name: "Twofish Official Vector: 128-bit zero key, zero plaintext",
        input: "00000000000000000000000000000000",
        expectedOutput: "9f589f5cf6122c32b6bfec2f2ae8c35a",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "Twofish Official Vector: 192-bit zero key, zero plaintext",
        input: "00000000000000000000000000000000",
        expectedOutput: "efa71f788965bd4453f860178fc19101",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "000000000000000000000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "Twofish Official Vector: 256-bit zero key, zero plaintext",
        input: "00000000000000000000000000000000",
        expectedOutput: "57ff739d4dc92c1bd7fc01700cc8216f",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "0000000000000000000000000000000000000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // Decrypt verification of official vectors
    {
        name: "Twofish Official Vector Decrypt: 128-bit zero key",
        input: "9f589f5cf6122c32b6bfec2f2ae8c35a",
        expectedOutput: "00000000000000000000000000000000",
        recipeConfig: [
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // ============================================================
    // Round-trip tests for ECB mode with various key sizes
    // ============================================================
    {
        name: "Twofish Round-trip: ECB 128-bit key",
        input: "Hello, World!!!",
        expectedOutput: "Hello, World!!!",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: ECB 192-bit key",
        input: "Testing Twofish with 192-bit key",
        expectedOutput: "Testing Twofish with 192-bit key",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: ECB 256-bit key",
        input: "Testing Twofish with 256-bit key encryption",
        expectedOutput: "Testing Twofish with 256-bit key encryption",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Round-trip tests for CBC mode
    {
        name: "Twofish Round-trip: CBC 128-bit key",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: CBC 192-bit key",
        input: "Testing Twofish with 192-bit key in CBC mode",
        expectedOutput: "Testing Twofish with 192-bit key in CBC mode",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f1011121314151617", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: CBC 256-bit key",
        input: "Testing Twofish with 256-bit key in CBC mode",
        expectedOutput: "Testing Twofish with 256-bit key in CBC mode",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Round-trip tests for CFB mode
    {
        name: "Twofish Round-trip: CFB 128-bit key",
        input: "Testing Twofish CFB mode encryption",
        expectedOutput: "Testing Twofish CFB mode encryption",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "deadbeefcafebabe0123456789abcdef", option: "Hex" },
                    { string: "0102030405060708090a0b0c0d0e0f10", option: "Hex" },
                    "CFB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "deadbeefcafebabe0123456789abcdef", option: "Hex" },
                    { string: "0102030405060708090a0b0c0d0e0f10", option: "Hex" },
                    "CFB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Round-trip tests for OFB mode
    {
        name: "Twofish Round-trip: OFB 128-bit key",
        input: "Testing Twofish OFB mode encryption",
        expectedOutput: "Testing Twofish OFB mode encryption",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "OFB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    "OFB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Round-trip tests for CTR mode
    {
        name: "Twofish Round-trip: CTR 128-bit key",
        input: "Testing Twofish CTR mode encryption",
        expectedOutput: "Testing Twofish CTR mode encryption",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "00000000000000000000000000000001", option: "Hex" },
                    "CTR", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // UTF8 key tests
    {
        name: "Twofish Round-trip: UTF8 key (16 bytes)",
        input: "Secret message!",
        expectedOutput: "Secret message!",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "MySecretPassword", option: "UTF8" },
                    { string: "InitVectorHere!!", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "MySecretPassword", option: "UTF8" },
                    { string: "InitVectorHere!!", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Various input length tests
    {
        name: "Twofish Round-trip: 1 byte input",
        input: "A",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: 15 byte input",
        input: "123456789012345",
        expectedOutput: "123456789012345",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: 16 byte input (exact block)",
        input: "1234567890123456",
        expectedOutput: "1234567890123456",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: 17 byte input",
        input: "12345678901234567",
        expectedOutput: "12345678901234567",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "Twofish Round-trip: 32 byte input (two blocks)",
        input: "12345678901234567890123456789012",
        expectedOutput: "12345678901234567890123456789012",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Binary data test
    {
        name: "Twofish Round-trip: Binary data",
        input: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        expectedOutput: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "Twofish Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Consistency test - same input should always produce same output
    {
        name: "Twofish Encrypt: 128-bit key consistency test",
        input: "TestData12345678",
        expectedOutput: "8aed2d3a85dc3e0b663ba1fe1fdaf056771d591428af301d69fa1e227d083527",
        recipeConfig: [
            {
                op: "Twofish Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            }
        ]
    }
]);
