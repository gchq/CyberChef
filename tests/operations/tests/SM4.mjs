/**
 * SM4 crypto tests.
 *
 * Test data used from IETF draft-ribose-cfrg-sm4-09, see:
 * https://tools.ietf.org/id/draft-ribose-cfrg-sm4-09.html
 *
 * @author swesven
 * @copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

/* Cleartexts */
const TWO_BLOCK_PLAIN = "aa aa aa aa bb bb bb bb cc cc cc cc dd dd dd dd ee ee ee ee ff ff ff ff aa aa aa aa bb bb bb bb";
const FOUR_BLOCK_PLAIN = "aa aa aa aa aa aa aa aa bb bb bb bb bb bb bb bb cc cc cc cc cc cc cc cc dd dd dd dd dd dd dd dd ee ee ee ee ee ee ee ee ff ff ff ff ff ff ff ff aa aa aa aa aa aa aa aa bb bb bb bb bb bb bb bb";
/* Keys */
const KEY_1 = "01 23 45 67 89 ab cd ef fe dc ba 98 76 54 32 10";
const KEY_2 = "fe dc ba 98 76 54 32 10 01 23 45 67 89 ab cd ef";
/* IV */
const IV = "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f";
/* Ciphertexts */
const ECB_1 = "5e c8 14 3d e5 09 cf f7 b5 17 9f 8f 47 4b 86 19 2f 1d 30 5a 7f b1 7d f9 85 f8 1c 84 82 19 23 04";
const ECB_2 = "c5 87 68 97 e4 a5 9b bb a7 2a 10 c8 38 72 24 5b 12 dd 90 bc 2d 20 06 92 b5 29 a4 15 5a c9 e6 00";
/* With PKCS#7 padding */
const ECB_1P ="5e c8 14 3d e5 09 cf f7 b5 17 9f 8f 47 4b 86 19 2f 1d 30 5a 7f b1 7d f9 85 f8 1c 84 82 19 23 04 00 2a 8a 4e fa 86 3c ca d0 24 ac 03 00 bb 40 d2";
const ECB_2P= "c5 87 68 97 e4 a5 9b bb a7 2a 10 c8 38 72 24 5b 12 dd 90 bc 2d 20 06 92 b5 29 a4 15 5a c9 e6 00 a2 51 49 20 93 f8 f6 42 89 b7 8d 6e 8a 28 b1 c6";
const CBC_1 = "78 eb b1 1c c4 0b 0a 48 31 2a ae b2 04 02 44 cb 4c b7 01 69 51 90 92 26 97 9b 0d 15 dc 6a 8f 6d";
const CBC_2 = "0d 3a 6d dc 2d 21 c6 98 85 72 15 58 7b 7b b5 9a 91 f2 c1 47 91 1a 41 44 66 5e 1f a1 d4 0b ae 38";
const OFB_1 = "ac 32 36 cb 86 1d d3 16 e6 41 3b 4e 3c 75 24 b7 1d 01 ac a2 48 7c a5 82 cb f5 46 3e 66 98 53 9b";
const OFB_2 = "5d cc cd 25 a8 4b a1 65 60 d7 f2 65 88 70 68 49 33 fa 16 bd 5c d9 c8 56 ca ca a1 e1 01 89 7a 97";
const CFB_1 = "ac 32 36 cb 86 1d d3 16 e6 41 3b 4e 3c 75 24 b7 69 d4 c5 4e d4 33 b9 a0 34 60 09 be b3 7b 2b 3f";
const CFB_2 = "5d cc cd 25 a8 4b a1 65 60 d7 f2 65 88 70 68 49 0d 9b 86 ff 20 c3 bf e1 15 ff a0 2c a6 19 2c c5";
const CTR_1 = "ac 32 36 cb 97 0c c2 07 91 36 4c 39 5a 13 42 d1 a3 cb c1 87 8c 6f 30 cd 07 4c ce 38 5c dd 70 c7 f2 34 bc 0e 24 c1 19 80 fd 12 86 31 0c e3 7b 92 6e 02 fc d0 fa a0 ba f3 8b 29 33 85 1d 82 45 14";
const CTR_2 = "5d cc cd 25 b9 5a b0 74 17 a0 85 12 ee 16 0e 2f 8f 66 15 21 cb ba b4 4c c8 71 38 44 5b c2 9e 5c 0a e0 29 72 05 d6 27 04 17 3b 21 23 9b 88 7f 6c 8c b5 b8 00 91 7a 24 88 28 4b de 9e 16 ea 29 06";

TestRegister.addTests([
    {
        name: "SM4 Encrypt: ECB 1, No padding",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: ECB_1,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: "", option: "Hex"}, "ECB/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: ECB 2, No padding",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: ECB_2,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: "", option: "Hex"}, "ECB/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: ECB 1, With padding",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: ECB_1P,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: "", option: "Hex"}, "ECB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: ECB 2, With padding",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: ECB_2P,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: "", option: "Hex"}, "ECB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CBC 1",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: CBC_1,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CBC/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CBC 2",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: CBC_2,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CBC/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: OFB1",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: OFB_1,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "OFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: OFB2",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: OFB_2,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "OFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CFB1",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: CFB_1,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CFB2",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: CFB_2,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CTR1",
        input: FOUR_BLOCK_PLAIN,
        expectedOutput: CTR_1,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CTR", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Encrypt: CTR1",
        input: FOUR_BLOCK_PLAIN,
        expectedOutput: CTR_2,
        recipeConfig: [
            {
                "op": "SM4 Encrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CTR", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: ECB 1",
        input: ECB_1,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: "", option: "Hex"}, "ECB/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: ECB 2",
        input: ECB_2,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: "", option: "Hex"}, "ECB/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CBC 1",
        input: CBC_1,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CBC/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CBC 2",
        input: CBC_2,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CBC/NoPadding", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: OFB1",
        input: TWO_BLOCK_PLAIN,
        expectedOutput: OFB_1,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "OFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: OFB2",
        input: OFB_2,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "OFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CFB1",
        input: CFB_1,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CFB2",
        input: CFB_2,
        expectedOutput: TWO_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CFB", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CTR1",
        input: CTR_1,
        expectedOutput: FOUR_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_1, option: "Hex"}, {string: IV, option: "Hex"}, "CTR", "Hex", "Hex"]
            }
        ]
    },
    {
        name: "SM4 Decrypt: CTR1",
        input: CTR_2,
        expectedOutput: FOUR_BLOCK_PLAIN,
        recipeConfig: [
            {
                "op": "SM4 Decrypt",
                "args": [{string: KEY_2, option: "Hex"}, {string: IV, option: "Hex"}, "CTR", "Hex", "Hex"]
            }
        ]
    },
]);
