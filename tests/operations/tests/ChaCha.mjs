/**
 * ChaCha tests.
 *
 * @author joostrijneveld [joost@joostrijneveld.nl]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "ChaCha: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes.

ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).`,
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: no nonce",
        input: "",
        expectedOutput: `Invalid nonce length: 0 bytes.

ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).`,
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: RFC8439",
        input: "Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.",
        expectedOutput: "6e 2e 35 9a 25 68 f9 80 41 ba 07 28 dd 0d 69 81 e9 7e 7a ec 1d 43 60 c2 0a 27 af cc fd 9f ae 0b f9 1b 65 c5 52 47 33 ab 8f 59 3d ab cd 62 b3 57 16 39 d6 24 e6 51 52 ab 8f 53 0c 35 9f 08 61 d8 07 ca 0d bf 50 0d 6a 61 56 a3 8e 08 8a 22 b6 5e 52 bc 51 4d 16 cc f8 06 81 8c e9 1a b7 79 37 36 5a f9 0b bf 74 a3 5b e6 b4 0b 8e ed f2 78 5e 42 87 4d",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00:01:02:03:04:05:06:07:08:09:0a:0b:0c:0d:0e:0f:10:11:12:13:14:15:16:17:18:19:1a:1b:1c:1d:1e:1f"},
                    {"option": "Hex", "string": "00:00:00:00:00:00:00:4a:00:00:00:00"},
                    1, "20", "Raw", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.1",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "29 56 0d 28 0b 45 28 40 0a 8f 4b 79 53 69 fb 3a 01 10 55 99 e9 f1 ed 58 27 9c fc 9e ce 2d c5 f9 9f 1c 2e 52 c9 82 38 f5 42 a5 c0 a8 81 d8 50 b6 15 d3 ac d9 fb db 02 6e 93 68 56 5d a5 0e 0d 49 dd 5b e8 ef 74 24 8b 3e 25 1d 96 5d 8f cb 21 e7 cf e2 04 d4 00 78 06 fb ee 3c e9 4c 74 bf ba d2 c1 1c 62 1b a0 48 14 7c 5c aa 94 d1 82 cc ff 6f d5 cf 44 ad f9 6e 3d 68 28 1b b4 96 76 af 87 e7",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "8", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.2",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "5e dd c2 d9 42 8f ce ee c5 0a 52 a9 64 ea e0 ff b0 4b 2d e0 06 a9 b0 4c ff 36 8f fa 92 11 16 b2 e8 e2 64 ba bd 2e fa 0d e4 3e f2 e3 b6 d0 65 e8 f7 c0 a1 78 37 b0 a4 0e b0 e2 c7 a3 74 2c 87 53 ed e5 f3 f6 d1 9b e5 54 67 5e 50 6a 77 5c 63 f0 94 d4 96 5c 31 93 19 dc d7 50 6f 45 7b 11 7b 84 b1 0b 24 6e 95 6c 2d a8 89 8a 65 6c ee f3 f7 b7 16 45 b1 9f 70 1d b8 44 85 ce 51 21 f0 f6 17 ef",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "12", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.3",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "d1 ab f6 30 46 7e b4 f6 7f 1c fb 47 cd 62 6a ae 8a fe db be 4f f8 fc 5f e9 cf ae 30 7e 74 ed 45 1f 14 04 42 5a d2 b5 45 69 d5 f1 81 48 93 99 71 ab b8 fa fc 88 ce 4a c7 fe 1c 3d 1f 7a 1e b7 ca e7 6c a8 7b 61 a9 71 35 41 49 77 60 dd 9a e0 59 35 0c ad 0d ce df aa 80 a8 83 11 9a 1a 6f 98 7f d1 ce 91 fd 8e e0 82 80 34 b4 11 20 0a 97 45 a2 85 55 44 75 d1 2a fc 04 88 7f ef 35 16 d1 2a 2c",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.4",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "db 43 ad 9d 1e 84 2d 12 72 e4 53 0e 27 6b 3f 56 8f 88 59 b3 f7 cf 6d 9d 2c 74 fa 53 80 8c b5 15 7a 8e bf 46 ad 3d cc 4b 6c 7d ad de 13 17 84 b0 12 0e 0e 22 f6 d5 f9 ff a7 40 7d 4a 21 b6 95 d9 c5 dd 30 bf 55 61 2f ab 9b dd 11 89 20 c1 98 16 47 0c 7f 5d cd 42 32 5d bb ed 8c 57 a5 62 81 c1 44 cb 0f 03 e8 1b 30 04 62 4e 06 50 a1 ce 5a fa f9 a7 cd 81 63 f6 db d7 26 02 25 7d d9 6e 47 1e",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff ff ee dd cc bb aa 99 88 77 66 55 44 33 22 11 00"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "8", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.5",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "7e d1 2a 3a 63 91 2a e9 41 ba 6d 4c 0d 5e 86 2e 56 8b 0e 55 89 34 69 35 50 5f 06 4b 8c 26 98 db f7 d8 50 66 7d 8e 67 be 63 9f 3b 4f 6a 16 f9 2e 65 ea 80 f6 c7 42 94 45 da 1f c2 c1 b9 36 50 40 e3 2e 50 c4 10 6f 3b 3d a1 ce 7c cb 1e 71 40 b1 53 49 3c 0f 3a d9 a9 bc ff 07 7e c4 59 6f 1d 0f 29 bf 9c ba a5 02 82 0f 73 2a f5 a9 3c 49 ee e3 3d 1c 4f 12 af 3b 42 97 af 91 fe 41 ea 9e 94 a2",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff ff ee dd cc bb aa 99 88 77 66 55 44 33 22 11 00"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "12", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "ChaCha: draft-strombergson-chacha-test-vectors-01 TC7.6",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "9f ad f4 09 c0 08 11 d0 04 31 d6 7e fb d8 8f ba 59 21 8d 5d 67 08 b1 d6 85 86 3f ab bb 0e 96 1e ea 48 0f d6 fb 53 2b fd 49 4b 21 51 01 50 57 42 3a b6 0a 63 fe 4f 55 f7 a2 12 e2 16 7c ca b9 31 fb fd 29 cf 7b c1 d2 79 ed df 25 dd 31 6b b8 84 3d 6e de e0 bd 1e f1 21 d1 2f a1 7c bc 2c 57 4c cc ab 5e 27 51 67 b0 8b d6 86 f8 a0 9d f8 7e c3 ff b3 53 61 b9 4e bf a1 3f ec 0e 48 89 d1 8d a5",
        recipeConfig: [
            {
                "op": "ChaCha",
                "args": [
                    {"option": "Hex", "string": "00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff ff ee dd cc bb aa 99 88 77 66 55 44 33 22 11 00"},
                    {"option": "Hex", "string": "0f 1e 2d 3c 4b 5a 69 78"},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
]);
