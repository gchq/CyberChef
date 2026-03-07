/**
 * TEA and XTEA cipher tests.
 *
 * Test vectors sourced from:
 * - TEA: https://www.cix.co.uk/~klockstone/teavect.htm (Wheeler & Needham reference)
 * - XTEA: https://github.com/golang/crypto/blob/master/xtea/xtea_test.go (Go standard library)
 *         Bouncy Castle XTEA test vectors (big-endian)
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

/**
 * TEA ECB Tests — Official test vectors from Wheeler & Needham
 *
 * From teavect.htm: TEA uses a fixed 32 cycles (64 Feistel rounds).
 * Row 1: plaintext 00000000 00000000, key 00000000 00000000 00000000 00000000
 *         -> ciphertext 41ea3a0a 94baa940
 */
TestRegister.addTests([
    // ==================== TEA ECB TESTS ====================
    {
        name: "TEA Encrypt: ECB, all-zero key and plaintext",
        input: "0000000000000000",
        expectedOutput: "41ea3a0a94baa940",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "TEA Decrypt: ECB, all-zero key",
        input: "41ea3a0a94baa940",
        expectedOutput: "0000000000000000",
        recipeConfig: [
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "TEA Encrypt then Decrypt: round-trip ECB",
        input: "48656c6c6f212121",
        expectedOutput: "48656c6c6f212121",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },

    // ==================== TEA CBC TEST ====================
    {
        name: "TEA Encrypt then Decrypt: round-trip CBC with PKCS5",
        input: "Hello TEA cipher!",
        expectedOutput: "Hello TEA cipher!",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ],
    },

    // ==================== TEA CTR TEST ====================
    {
        name: "TEA Encrypt then Decrypt: round-trip CTR",
        input: "Short",
        expectedOutput: "Short",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0102030405060708"},
                    "CTR", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0102030405060708"},
                    "CTR", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== TEA CFB TEST ====================
    {
        name: "TEA Encrypt then Decrypt: round-trip CFB",
        input: "CFB mode testing with TEA",
        expectedOutput: "CFB mode testing with TEA",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "aabbccddeeff0011"},
                    "CFB", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "aabbccddeeff0011"},
                    "CFB", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== TEA OFB TEST ====================
    {
        name: "TEA Encrypt then Decrypt: round-trip OFB",
        input: "OFB mode testing with TEA",
        expectedOutput: "OFB mode testing with TEA",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "1122334455667788"},
                    "OFB", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "1122334455667788"},
                    "OFB", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== XTEA ECB TESTS ====================
    // Go standard library + Bouncy Castle test vectors (big-endian)
    {
        name: "XTEA Encrypt: ECB, sequential key, 'ABCDEFGH'",
        input: "4142434445464748",
        expectedOutput: "497df3d072612cb5",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Decrypt: ECB, sequential key",
        input: "497df3d072612cb5",
        expectedOutput: "4142434445464748",
        recipeConfig: [
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, sequential key, 'AAAAAAAA'",
        input: "4141414141414141",
        expectedOutput: "e78f2d13744341d8",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, sequential key, plaintext 5a5b6e27",
        input: "5a5b6e278948d77f",
        expectedOutput: "4141414141414141",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, all-zero key, 'ABCDEFGH'",
        input: "4142434445464748",
        expectedOutput: "a0390589f8b8efa5",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, all-zero key, 'AAAAAAAA'",
        input: "4141414141414141",
        expectedOutput: "ed23375a821a8c2d",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, all-zero key, all-zero plaintext",
        input: "0000000000000000",
        expectedOutput: "dee9d4d8f7131ed9",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, all-zero key, sequential plaintext",
        input: "0102030405060708",
        expectedOutput: "065c1b8975c6a816",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, pattern key, all-zero plaintext",
        input: "0000000000000000",
        expectedOutput: "1ff9a0261ac64264",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456712345678234567893456789a"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: ECB, pattern key, sequential plaintext",
        input: "0102030405060708",
        expectedOutput: "8c67155b2ef91ead",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456712345678234567893456789a"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Decrypt: ECB, pattern key, sequential ciphertext",
        input: "8c67155b2ef91ead",
        expectedOutput: "0102030405060708",
        recipeConfig: [
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456712345678234567893456789a"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },

    // ==================== XTEA CBC TEST ====================
    {
        name: "XTEA Encrypt then Decrypt: round-trip CBC with PKCS5",
        input: "Hello XTEA cipher!",
        expectedOutput: "Hello XTEA cipher!",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "fedcba9876543210"},
                    "CBC", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "fedcba9876543210"},
                    "CBC", "Hex", "Raw", "PKCS5"
                ]
            }
        ],
    },

    // ==================== XTEA OFB TEST ====================
    {
        name: "XTEA Encrypt then Decrypt: round-trip OFB",
        input: "Stream mode test",
        expectedOutput: "Stream mode test",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0102030405060708"},
                    "OFB", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0102030405060708"},
                    "OFB", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== XTEA CTR TEST ====================
    {
        name: "XTEA Encrypt then Decrypt: round-trip CTR",
        input: "CTR mode with XTEA",
        expectedOutput: "CTR mode with XTEA",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0000000000000001"},
                    "CTR", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "deadbeefdeadbeefdeadbeefdeadbeef"},
                    {"option": "Hex", "string": "0000000000000001"},
                    "CTR", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== XTEA CFB TEST ====================
    {
        name: "XTEA Encrypt then Decrypt: round-trip CFB",
        input: "CFB mode with XTEA cipher",
        expectedOutput: "CFB mode with XTEA cipher",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "aabbccddeeff0011"},
                    "CFB", "Raw", "Hex", "NO"
                ]
            },
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": "aabbccddeeff0011"},
                    "CFB", "Hex", "Raw", "NO"
                ]
            }
        ],
    },

    // ==================== EDGE CASES ====================
    {
        name: "TEA Encrypt: empty input returns empty",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt: empty input returns empty",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Hex", "NO"
                ]
            }
        ],
    },

    // ==================== MULTI-BLOCK ECB TESTS ====================
    {
        name: "TEA Encrypt then Decrypt: multi-block ECB with PKCS5",
        input: "This is a longer message that spans multiple TEA blocks!",
        expectedOutput: "This is a longer message that spans multiple TEA blocks!",
        recipeConfig: [
            {
                "op": "TEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                "op": "TEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ],
    },
    {
        name: "XTEA Encrypt then Decrypt: multi-block ECB with PKCS5",
        input: "This is a longer message that spans multiple XTEA blocks!",
        expectedOutput: "This is a longer message that spans multiple XTEA blocks!",
        recipeConfig: [
            {
                "op": "XTEA Encrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Raw", "Hex", "PKCS5"
                ]
            },
            {
                "op": "XTEA Decrypt",
                "args": [
                    {"option": "Hex", "string": "0123456789abcdef0123456789abcdef"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Raw", "PKCS5"
                ]
            }
        ],
    },
]);
