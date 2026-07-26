/**
 * PRESENT cipher tests.
 *
 * Test vectors from the original PRESENT paper:
 * "PRESENT: An Ultra-Lightweight Block Cipher"
 * https://link.springer.com/chapter/10.1007/978-3-540-74735-2_31
 * https://www.iacr.org/archive/ches2007/47270450/47270450.pdf
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
    // OFFICIAL TEST VECTORS from the original PRESENT paper:
    // "PRESENT: An Ultra-Lightweight Block Cipher" (Bogdanov et al., CHES 2007)
    // https://link.springer.com/chapter/10.1007/978-3-540-74735-2_31
    // Table 3: Test Vectors
    // ============================================================
    {
        name: "PRESENT Official Vector 1: 80-bit zero key, zero plaintext",
        input: "0000000000000000",
        expectedOutput: "5579c1387b228445",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 2: 80-bit all-ones key, zero plaintext",
        input: "0000000000000000",
        expectedOutput: "e72c46c0f5945049",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "ffffffffffffffffffff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 3: 80-bit zero key, all-ones plaintext",
        input: "ffffffffffffffff",
        expectedOutput: "a112ffc72f68417b",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 4: 80-bit all-ones key, all-ones plaintext",
        input: "ffffffffffffffff",
        expectedOutput: "3333dcd3213210d2",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "ffffffffffffffffffff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 5: 128-bit zero key, zero plaintext",
        input: "0000000000000000",
        expectedOutput: "96db702a2e6900af",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 6: 128-bit key (SageMath reference)",
        input: "0123456789abcdef",
        expectedOutput: "0e9d28685e671dd6",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "0123456789abcdef0123456789abcdef", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    // Decrypt verification of official vectors
    {
        name: "PRESENT Official Vector 1 Decrypt: 80-bit zero key",
        input: "5579c1387b228445",
        expectedOutput: "0000000000000000",
        recipeConfig: [
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 4 Decrypt: 80-bit all-ones key",
        input: "3333dcd3213210d2",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "ffffffffffffffffffff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 5 Decrypt: 128-bit zero key",
        input: "96db702a2e6900af",
        expectedOutput: "0000000000000000",
        recipeConfig: [
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ]
    },
    {
        name: "PRESENT Official Vector 6 Decrypt: 128-bit key (SageMath reference)",
        input: "0e9d28685e671dd6",
        expectedOutput: "0123456789abcdef",
        recipeConfig: [
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "0123456789abcdef0123456789abcdef", option: "Hex" },
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
        name: "PRESENT Round-trip: ECB 80-bit key, short message",
        input: "Hello!!!",
        expectedOutput: "Hello!!!",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: CBC 80-bit key, long message",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "aabbccddeeff00112233", option: "Hex" },
                    { string: "0011223344556677", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "aabbccddeeff00112233", option: "Hex" },
                    { string: "0011223344556677", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: ECB 128-bit key",
        input: "Testing PRESENT cipher with 128-bit key",
        expectedOutput: "Testing PRESENT cipher with 128-bit key",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899aabbccddeeff", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: CBC 128-bit key",
        input: "PRESENT is an ultra-lightweight block cipher!",
        expectedOutput: "PRESENT is an ultra-lightweight block cipher!",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "8877665544332211", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766554433221100", option: "Hex" },
                    { string: "8877665544332211", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: UTF8 key (10 bytes)",
        input: "Secret message",
        expectedOutput: "Secret message",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "mypassword", option: "UTF8" },
                    { string: "initvect", option: "UTF8" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "mypassword", option: "UTF8" },
                    { string: "initvect", option: "UTF8" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },

    // Encryption consistency tests - verify same input always produces same output
    {
        name: "PRESENT Encrypt: 80-bit zero key consistency",
        input: "TestData",
        expectedOutput: "b78cfea5ffcd89f265585a6ce7312131",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Encrypt: 128-bit zero key consistency",
        input: "TestData",
        expectedOutput: "e127a24e38de2c36407e794ef5dffefd",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00000000000000000000000000000000", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Various lengths 1 byte",
        input: "A",
        expectedOutput: "A",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Various lengths 7 bytes",
        input: "1234567",
        expectedOutput: "1234567",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Various lengths 8 bytes (exact block)",
        input: "12345678",
        expectedOutput: "12345678",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Various lengths 9 bytes",
        input: "123456789",
        expectedOutput: "123456789",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Various lengths 16 bytes (two blocks)",
        input: "1234567890ABCDEF",
        expectedOutput: "1234567890ABCDEF",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "00112233445566778899", option: "Hex" },
                    { string: "", option: "Hex" },
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    },
    {
        name: "PRESENT Round-trip: Binary data",
        input: "\x00\x01\x02\x03\x04\x05\x06\x07",
        expectedOutput: "\x00\x01\x02\x03\x04\x05\x06\x07",
        recipeConfig: [
            {
                op: "PRESENT Encrypt",
                args: [
                    { string: "ffeeddccbbaa99887766", option: "Hex" },
                    { string: "0011223344556677", option: "Hex" },
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                op: "PRESENT Decrypt",
                args: [
                    { string: "ffeeddccbbaa99887766", option: "Hex" },
                    { string: "0011223344556677", option: "Hex" },
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ]
    }
]);
