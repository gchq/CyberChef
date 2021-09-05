import TestRegister from "../../lib/TestRegister.mjs";
TestRegister.addTests([
    // The following Python script, using PyCryptoDome, was used to generate the test vectors
    /*
    from Crypto.Cipher import Salsa20
    import binascii

    input_data = b"The quick brown fox jumps over the lazy dog."
    keyHex = "0000000000000000000000000000000000000000000000000000000000000000"
    nonceHex = "0000000000000000"
    key = binascii.unhexlify(keyHex)
    nonce = binascii.unhexlify(nonceHex)

    cipher = Salsa20.new(key, nonce)
    cipher_text = cipher.encrypt(input_data)
    cipher_text = binascii.hexlify(cipher_text).decode("UTF-8")

    print("Key: {}\nNonce: {}\nCiphertext: {}".format(keyHex, nonceHex, cipher_text))
    */
    {
        name: "Salsa20 Encrypt: 128 bit key, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "317bc88ebe9e7b2f779e09a8801e656f9d6fc8dcc6965198755944c271f239ec5cda91a3bc732122a286390b",
        recipeConfig: [
            {
                "op": "Salsa20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Salsa20 Decrypt: 128 bit key, ASCII",
        input: "317bc88ebe9e7b2f779e09a8801e656f9d6fc8dcc6965198755944c271f239ec5cda91a3bc732122a286390b",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Salsa20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Salsa20 Encrypt: 256 bit key, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "ceff937bea391b78fd2a05532a8bc6f485411fd97b6bc409bdbc2750e518ce92558ce0b64aad803ed8dd04b5",
        recipeConfig: [
            {
                "op": "Salsa20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000000"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "Salsa20 Decrypt: 256 bit key, ASCII",
        input: "ceff937bea391b78fd2a05532a8bc6f485411fd97b6bc409bdbc2750e518ce92558ce0b64aad803ed8dd04b5",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Salsa20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "0000000000000000000000000000000000000000000000000000000000000000"},
                    {"option": "Hex", "string": "0000000000000000"},
                    "Hex", "Raw"
                ]
            }
        ],
    },
    {
        name: "Salsa20 Encrypt: 256 bit key, Hex",
        input: "8ad48372ec567a31c045cec2076b4ce9da3d121c05167a6e0da55097ba83da13c949aaea0192d793",
        expectedOutput: "4d92211d0fe3d6e1af3f0367f2220c915ede3420fe407faaa501e6c15ed5d8dc7b60bc877c82588f",
        recipeConfig: [
            {
                "op": "Salsa20 Encrypt",
                "args": [
                    {"option": "Hex", "string": "17719ee20528b23779a0c87a4fc321b69d8917b4ecf5273bf2464dc0cfe23399"},
                    {"option": "Hex", "string": "69df3240cae9fb69"},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Salsa20 Decrypt: 256 bit key, Hex",
        input: "4d92211d0fe3d6e1af3f0367f2220c915ede3420fe407faaa501e6c15ed5d8dc7b60bc877c82588f",
        expectedOutput: "8ad48372ec567a31c045cec2076b4ce9da3d121c05167a6e0da55097ba83da13c949aaea0192d793",
        recipeConfig: [
            {
                "op": "Salsa20 Decrypt",
                "args": [
                    {"option": "Hex", "string": "17719ee20528b23779a0c87a4fc321b69d8917b4ecf5273bf2464dc0cfe23399"},
                    {"option": "Hex", "string": "69df3240cae9fb69"},
                    "Hex", "Hex"
                ]
            }
        ],
    }
]);
