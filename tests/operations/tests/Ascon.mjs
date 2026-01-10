/**
 * Ascon tests.
 *
 * Test vectors include official NIST ACVP vectors from:
 * https://github.com/usnistgov/ACVP-Server/tree/master/gen-val/json-files/Ascon-Hash256-SP800-232
 * https://github.com/ascon/ascon-c (LWC_AEAD_KAT files)
 *
 * @author Claude
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ============= Ascon Hash Tests (NIST SP 800-232) =============
    // Official NIST ACVP test vector
    {
        name: "Ascon Hash: NIST ACVP vector (msg=0x50)",
        input: "P",  // 0x50
        expectedOutput: "b96da347d720272533a87f5a94a356155f49cdf7c0c10a3e6f346d8a2293e480",
        recipeConfig: [
            {
                "op": "Ascon Hash",
                "args": []
            }
        ],
    },
    {
        name: "Ascon Hash: empty input",
        input: "",
        expectedOutput: "0b3be5850f2f6b98caf29f8fdea89b64a1fa70aa249b8f839bd53baa304d92b2",
        recipeConfig: [
            {
                "op": "Ascon Hash",
                "args": []
            }
        ],
    },
    {
        name: "Ascon Hash: Hello",
        input: "Hello",
        expectedOutput: "c1beebe1251d562c4526d6b947cefb932998499424f6cd186e764aa0a36cddb7",
        recipeConfig: [
            {
                "op": "Ascon Hash",
                "args": []
            }
        ],
    },
    {
        name: "Ascon Hash: Hello, World!",
        input: "Hello, World!",
        expectedOutput: "f40e1ce8d4272e628e9535193f196f4ff2a720b00f6380c5d6f16b975f3a7777",
        recipeConfig: [
            {
                "op": "Ascon Hash",
                "args": []
            }
        ],
    },

    // ============= Ascon MAC Tests =============
    {
        name: "Ascon MAC: basic MAC",
        input: "Hello",
        expectedOutput: "f58f344a2415ddf1a81defffe461db6c",
        recipeConfig: [
            {
                "op": "Ascon MAC",
                "args": [
                    {"option": "UTF8", "string": "secretkey1234567"}
                ]
            }
        ],
    },
    {
        name: "Ascon MAC: test message",
        input: "test message",
        expectedOutput: "2b9993206b3fd09d6a32392b13247856",
        recipeConfig: [
            {
                "op": "Ascon MAC",
                "args": [
                    {"option": "UTF8", "string": "secretkey1234567"}
                ]
            }
        ],
    },

    // ============= Ascon Encrypt Tests (NIST SP 800-232) =============
    // Official NIST ascon-c KAT test vector (Count=1)
    {
        name: "Ascon Encrypt: NIST KAT Count=1 (empty PT, empty AD)",
        input: "",
        expectedOutput: "4f9c278211bec9316bf68f46ee8b2ec6",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "101112131415161718191a1b1c1d1e1f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    // Official NIST ascon-c KAT test vector (Count=2)
    {
        name: "Ascon Encrypt: NIST KAT Count=2 (empty PT, AD=0x30)",
        input: "",
        expectedOutput: "cccb674fe18a09a285d6ab11b35675c0",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "101112131415161718191a1b1c1d1e1f"},
                    {"option": "Hex", "string": "30"},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: no key",
        input: "test message",
        expectedOutput: `Invalid key length: 0 bytes.

Ascon-AEAD128 requires a key of exactly 16 bytes (128 bits).`,
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: invalid key length",
        input: "test message",
        expectedOutput: `Invalid key length: 8 bytes.

Ascon-AEAD128 requires a key of exactly 16 bytes (128 bits).`,
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "0001020304050607"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: no nonce",
        input: "test message",
        expectedOutput: `Invalid nonce length: 0 bytes.

Ascon-AEAD128 requires a nonce of exactly 16 bytes (128 bits).`,
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: invalid nonce length",
        input: "test message",
        expectedOutput: `Invalid nonce length: 12 bytes.

Ascon-AEAD128 requires a nonce of exactly 16 bytes (128 bits).`,
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: basic encryption",
        input: "Hello",
        expectedOutput: "af14bce6b9b6588c3aa63f9ddc5a0cf5f565f358b0",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: with associated data",
        input: "Hello",
        expectedOutput: "351880c09f9dee12c20c4ba973066bc10dd26000b6",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": "metadata"},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: longer message",
        input: "test message",
        expectedOutput: "9314a3fef6cc299a07b8c9e0f9e479ca0d1187e87345cf590adc572b",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: empty plaintext",
        input: "",
        expectedOutput: "4427d64b8e1e1451fc445960f0839bb0",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Ascon Encrypt: zero key and nonce",
        input: "Hello",
        expectedOutput: "403281e117ebb087e2d9196552b2d123bccb7b5500",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    "Raw", "Hex"
                ]
            }
        ],
    },

    // ============= Ascon Decrypt Tests =============
    {
        name: "Ascon Decrypt: no key",
        input: "af14bce6b9b6588c3aa63f9ddc5a0cf5f565f358b0",
        expectedOutput: `Invalid key length: 0 bytes.

Ascon-AEAD128 requires a key of exactly 16 bytes (128 bits).`,
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: basic decryption",
        input: "af14bce6b9b6588c3aa63f9ddc5a0cf5f565f358b0",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: with associated data",
        input: "351880c09f9dee12c20c4ba973066bc10dd26000b6",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": "metadata"},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: longer message",
        input: "9314a3fef6cc299a07b8c9e0f9e479ca0d1187e87345cf590adc572b",
        expectedOutput: "test message",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: authentication failure (tampered ciphertext)",
        input: "bf14bce6b9b6588c3aa63f9ddc5a0cf5f565f358b0",
        expectedOutput: "Unable to decrypt: authentication failed. The ciphertext, key, nonce, or associated data may be incorrect or tampered with.",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: authentication failure (wrong key)",
        input: "af14bce6b9b6588c3aa63f9ddc5a0cf5f565f358b0",
        expectedOutput: "Unable to decrypt: authentication failed. The ciphertext, key, nonce, or associated data may be incorrect or tampered with.",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "ff0102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Ascon Decrypt: authentication failure (wrong associated data)",
        input: "351880c09f9dee12c20c4ba973066bc10dd26000b6",
        expectedOutput: "Unable to decrypt: authentication failed. The ciphertext, key, nonce, or associated data may be incorrect or tampered with.",
        recipeConfig: [
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "UTF8", "string": "wrong data"},
                    "Hex", "Raw"
                ]
            }
        ],
    },

    // ============= Round-trip Tests =============
    {
        name: "Ascon: encrypt then decrypt round-trip",
        input: "This is a test message for Ascon AEAD encryption!",
        expectedOutput: "This is a test message for Ascon AEAD encryption!",
        recipeConfig: [
            {
                "op": "Ascon Encrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "101112131415161718191a1b1c1d1e1f"},
                    {"option": "UTF8", "string": "additional data"},
                    "Raw", "Hex"
                ]
            },
            {
                "op": "Ascon Decrypt",
                "args": [
                    {"option": "Hex", "string": "000102030405060708090a0b0c0d0e0f"},
                    {"option": "Hex", "string": "101112131415161718191a1b1c1d1e1f"},
                    {"option": "UTF8", "string": "additional data"},
                    "Hex", "Raw"
                ]
            }
        ],
    },
]);
