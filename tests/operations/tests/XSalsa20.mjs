/**
 * XSalsa20 tests.
 *
 * @author joostrijneveld [joost@joostrijneveld.nl]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XSalsa20: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes.

XSalsa20 uses a key of 16 or 32 bytes (128 or 256 bits).`,
        recipeConfig: [
            {
                "op": "XSalsa20",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "XSalsa20: no nonce",
        input: "",
        expectedOutput: `Invalid nonce length: 0 bytes.

XSalsa20 uses a nonce of 24 bytes (192 bits).`,
        recipeConfig: [
            {
                "op": "XSalsa20",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": ""},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    },
    {
        name: "XSalsa20 custom vector",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
        expectedOutput: "7c b6 60 af dd 9e c6 46 8f 57 dd 6d 24 33 f9 34 28 fd 82 cd 73 86 c5 47 1a 24 d8 ad 2a 52 5b 6e 5e ff 38 4f c7 ca a2 10 bb 3c 8f 3e 68 8f 4a 97 52 a5 46 df 8c 25 3f ef 17 a2 67 94 55 c7 a1 e1 83 db f5 d5 45 b0 f5 02 b9 8d e0 99 7a 66 ab 43 23 41 68 9f f3 97 dc 4f bc 1f 27 bd 1a 61 97 f5 dc 80 ff 19 05 16 c9 ed 14 f2 81 d1 ca 73 88 82 f6 d3 d2 fb 92 1e 2e f8 99 38 9e 0a 22 3b e7 ae 81 5a 04 86 5f 82 52 68 2f 6a d1 4f 98 ff 5f 08 23 cc 22 9d d2 22 9e 69 9d c2 1a 81 7d c9 54 bb 9b c9 0d ec 3b 9b d3 bf 20 9b 82 da f7 89 34 8a 5e 14 ec 54 2b 6d ee 8b 60 1e 7e 6d e3 c2 8a 2d 57 b6 25 e7 ea b3 43 d8 eb 20 85 b6 f6 82 09 58 99 35 20 44 22 60 60 61 d2 8d e9 8b ea 58 af bf ba ad 70 03 98 19 a0 c3 9a a8 63 94 47 5c d0 61 94 b0 17 ab c4 bb 28 b7 56 6d 3c 66 1c 76 f4 8a d3 a3 a2 9e d3 36 df 1f c6 8b 4f 44 2f 06 a3 58 0b ae c8 06 e2 e6 5d 39 ab 18 28 fe 80 18 12 69 2c 60 34 b5 0b f5 f3 3c 51 fc 0c fb 43 82 1e 3e 92 d6 b8 06 cf 00 16 e3 49 a0 34 83 20 f9 b0 53 7e ad ac 4a c1 36 5f cc fb be e2 ba 5a ad 1d 29 74 07 19 34 61 0e 9d ce 84 60 24 6a e6 8d ed 50 e0 20 44 26 d8 76 6d f2 da 4b 12 72 5a 85 c2 b1 07 04 f5 10 2e 3c 67 1c 5a fc 5b 46 0e 4d fb 39 b6 10 73 22 47 84 10 93 df 5f c8 92 7e 87 c3 0d 24 3a 48 b2 ad c2 56 3d a2 22 e9 02 9c 58 64 c6 d5 a5 f8 c6 54 99 1c 0f 6b f3 db ed 81 16 85 28 17 b0 eb 11 c7 05 9f f9 d8 fc 4a 1c 36 db 16 fd 38 d8 32 34 5b 8c 80 c6 51 21 1d 91 01 c5 8a 60 ad a4 39 33 d5 32 9a c1 f5 b2 ab 20 46 75 db 63 e0 bd d2 97 c0 e9 fc 1c d9 17 4a d1 3a db ea c2 8c 46 22 21 c3 5a bf 6c 1e cf 28 9c 8c 2f b2 0f",
        recipeConfig: [
            {
                "op": "XSalsa20",
                "args": [
                    {"option": "Hex", "string": "00:01:02:03:04:05:06:07:08:09:0A:0B:0C:0D:0E:0F:10:11:12:13:14:15:16:17:18:19:1A:1B:1C:1D:1E:1F"},
                    {"option": "Hex", "string": "00:01:02:03:04:05:06:07:08:09:0A:0B:0C:0D:0E:0F:10:11:12:13:14:15:16:17"},
                    0, "20", "Hex", "Hex",
                ]
            }
        ],
    }
]);
