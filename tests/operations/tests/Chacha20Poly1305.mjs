import TestRegister from "../../lib/TestRegister.mjs";
TestRegister.addTests([
    {
        // https://tools.ietf.org/html/draft-agl-tls-chacha20poly1305-04#section-7
        name: "Chacha20 Encrypt: Reference Test Vector 1",
        // XOR with 0 to get the keystream
        input:          "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput: "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586",
        recipeConfig: [
            {
                "op": "Chacha20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000000"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // Nonce
                    "Hex", "Hex",
                    "Chacha20", // Mode
                    {"option": "Hex", "string": ""} // AAD (irrelevant here)
                ]
            }
        ]
    },
    {
        name: "Chacha20 Decrypt: Reference Test Vector 1",
        // XOR with 0 to get the keystream
        input:          "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586",
        expectedOutput: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        recipeConfig: [
            {
                "op": "Chacha20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000000"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // Nonce
                    "Hex", "Hex",
                    "Chacha20", // Mode
                    {"option": "Hex", "string": ""}, // AAD (irrelevant here)
                    {"option": "Hex", "string": ""} // Tag (irrelevant here)
                ]
            }
        ]
    },
    {
        // https://tools.ietf.org/html/draft-agl-tls-chacha20poly1305-04#section-7
        name: "Chacha20 Encrypt: Reference Test Vector 2",
        // XOR with 0 to get the keystream
        input:          "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        expectedOutput: "4540f05a9f1fb296d7736e7b208e3c96eb4fe1834688d2604f450952ed432d41bbe2a0b6ea7566d2a5d1e7e20d42af2c53d792b1c43fea817e9ad275ae546963",
        recipeConfig: [
            {
                "op": "Chacha20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000001"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // Nonce
                    "Hex", "Hex",
                    "Chacha20", // Mode
                    {"option": "Hex", "string": ""}, // AAD (irrelevant here)
                ]
            }
        ]
    },
    {
        name: "Chacha20 Decrypt: Reference Test Vector 2",
        // XOR with 0 to get the keystream
        expectedOutput: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        input:          "4540f05a9f1fb296d7736e7b208e3c96eb4fe1834688d2604f450952ed432d41bbe2a0b6ea7566d2a5d1e7e20d42af2c53d792b1c43fea817e9ad275ae546963",
        recipeConfig: [
            {
                "op": "Chacha20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000001"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // Nonce
                    "Hex", "Hex",
                    "Chacha20", // Mode
                    {"option": "Hex", "string": ""}, // AAD (irrelevant here)
                    {"option": "Hex", "string": ""} // Tag (irrelevant here)
                ]
            }
        ]
    },
    {
        // https://tools.ietf.org/html/rfc8439#section-2.8.2
        name: "Chacha20-Poly1305 Encrypt: Test Vector 1",
        input: "Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.",
        expectedOutput: "d31a8d34648e60db7b86afbc53ef7ec2a4aded51296e08fea9e2b5a736ee62d63dbea45e8ca9671282fafb69da92728b1a71de0a9e0\
60b2905d6a5b67ecd3b3692ddbd7f2d778b8c9803aee328091b58fab324e4fad675945585808b4831d7bc3ff4def08e4b7a9de576d26586cec64b6116\n\n\
Tag: 1ae10b594f09e26a7e902ecbd0600691",
        recipeConfig: [
            {
                "op": "Chacha20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f"}, // Key
                    {"option": "Hex", "string": "070000004041424344454647"}, // Nonce
                    "Raw", "Hex",
                    "Chacha20-Poly1305",
                    {"option": "Hex", "string": "50515253c0c1c2c3c4c5c6c7"} // AAD
                ]
            }
        ],
    },
    {
        // https://tools.ietf.org/html/rfc8439#appendix-A.5
        name: "Chacha20-Poly1305 Decrypt: Test Vector 2",
        input: "64a0861575861af460f062c79be643bd5e805cfd345cf389f108670ac76c8cb24c6cfc18755d43eea09ee94e382d26b0bdb7b73c321b\
0100d4f03b7f355894cf332f830e710b97ce98c8a84abd0b948114ad176e008d33bd60f982b1ff37c8559797a06ef4f0ef61c186324e2b3506383606907b\
6a7c02b0f9f6157b53c867e4b9166c767b804d46a59b5216cde7a4e99040c5a40433225ee282a1b0a06c523eaf4534d7f83fa1155b0047718cbc546a0d07\
2b04b3564eea1b422273f548271a0bb2316053fa76991955ebd63159434ecebb4e466dae5a1073a6727627097a1049e617d91d361094fa68f0ff77987130\
305beaba2eda04df997b714d6c6f2c29a6ad5cb4022b02709b",
        expectedOutput: "Internet-Drafts are draft documents valid for a maximum of six months and may be updated, replaced, \
or obsoleted by other documents at any time. It is inappropriate to use Internet-Drafts as reference material or to cite them\
 other than as /“work in progress./”",
        recipeConfig: [
            {
                "op": "Chacha20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "1c9240a5eb55d38af333888604f6b5f0473917c1402b80099dca5cbc207075c0"}, // Key
                    {"option": "Hex", "string": "000000000102030405060708"}, // Nonce
                    "Hex", "Raw",
                    "Chacha20-Poly1305", // Mode
                    {"option": "Hex", "string": "f33388860000000000004e91"}, // AAD
                    {"option": "Hex", "string": "eead9d67890cbb22392336fea1851f38"} // Tag
                ]
            }
        ]
    }
]);
