/**
 * Crypt tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    /**
     * Ciphers
     *
     * The following expectedOutputs were generated using the following command format:
     * > openssl enc -aes-128-cbc -in test.txt -out test.enc -K "00112233445566778899aabbccddeeff" -iv "00112233445566778899aabbccddeeff"
     * > xxd -p test.enc | tr -d '\n' | xclip -selection clipboard
     *
     * All random data blocks (binary input, keys and IVs) were generated from /dev/urandom using dd:
     * > dd if=/dev/urandom of=key.txt bs=16 count=1
     *
     *
     * The following is a Python script used to generate the AES-GCM tests.
     * It uses PyCryptodome (https://www.pycryptodome.org) to handle the AES encryption and decryption.
     *
     * from Crypto.Cipher import AES
     * import binascii

     * input_data = "0123456789ABCDEF"
     * key = binascii.unhexlify("00112233445566778899aabbccddeeff")
     * iv = binascii.unhexlify("ffeeddccbbaa99887766554433221100")
     *
     * cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
     * cipher_text, tag = cipher.encrypt_and_digest(binascii.unhexlify(input_data))
     *
     * cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
     * decrypted = cipher.decrypt_and_verify(cipher_text, tag)
     *
     * key = binascii.hexlify(key).decode("UTF-8")
     * iv = binascii.hexlify(iv).decode("UTF-8")
     * cipher_text = binascii.hexlify(cipher_text).decode("UTF-8")
     * tag = binascii.hexlify(tag).decode("UTF-8")
     * decrypted = binascii.hexlify(decrypted).decode("UTF-8")
     *
     * print("Key: {}\nIV : {}\nInput data: {}\n\nEncrypted ciphertext: {}\nGCM tag: {}\n\nDecrypted plaintext : {}".format(key, iv, input_data, cipher_text, tag, decrypted))
     *
     *
     * Outputs:
     * Key: 00112233445566778899aabbccddeeff
     * IV : ffeeddccbbaa99887766554433221100
     * Input data: 0123456789ABCDEF
     *
     * Encrypted ciphertext: 8feeafedfdb2f6f9
     * GCM tag: 654ef4957c6e2b0cc6501d8f9bcde032
     *
     * Decrypted plaintext : 0123456789abcdef
     */
    {
        name: "AES Encrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`,
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CBC with IV0, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "2ef6c3fdb1314b5c2c326a2087fe1a82d5e73bf605ec8431d73e847187fc1c8fbbe969c177df1ecdf8c13f2f505f9498",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    "CBC", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CTR with IV0, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "a98c9e8e3b7c894384d740e4f0f4ed0be2bbb1e0e13a255812c3c6b0a629e4ad759c075b2469c6f4fb2c0cf9",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    "CTR", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CBC with IV1, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "4fa077d50cc71a57393e7b542c4e3aea0fb75383b97083f2f568ffc13c0e7a47502ec6d9f25744a061a3a5e55fe95e8d",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CBC", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CFB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "369e1c9e5a85b0520f3e61eecc37759246ad0a02cae7a99a3d250ae39cad4743385375cf63720d52ae8cdfb9",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CFB", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-OFB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "369e1c9e5a85b0520f3e61eecc37759288cb378c5fa9c675bd6c4ede0ae6a925eaebc8e0a6162d2a000ddc0f",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "OFB", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CTR, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "369e1c9e5a85b0520f3e61eecc37759206f6f1ba63527af96fae3b15a921844df2e542902a4f0525dbb4146b",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CTR", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-ECB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "2ef6c3fdb1314b5c2c326a2087fe1a8238c5a5db7dff38f6f4eb75b2e55cab3d8d6113eb8d3517223b4545fcdb4c5a48",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-GCM, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: `d0bcace0fa3a214b0ac3cbb4ac2caaf97b965f172f66d2a4ec6304a15a4072f1b28a6f9b80473f86bfa47b2c

Tag: 16a3e732a605cc9ca29108f742ca0743`,
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": ""},
                    "GCM", "Raw", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "bf2ccb148e5df181a46f39764047e24fc94cc46bbe6c8d160fc25a977e4b630883e9e04d3eeae3ccbb2d57a4c22e61909f2b6d7b24940abe95d356ce986294270d0513e0ffe7a9928fa6669e1aaae4379310281dc27c0bb9e254684b2ecd7f5f944c8218f3bc680570399a508dfe4b65",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "17211941bb2fa43d54d9fa59072436422a55be7a2be164cf5ec4e50e7a0035094ab684dab8d45a4515ae95c4136ded98898f74d4ecc4ac57ae682a985031ecb7518ddea6c8d816349801aa22ff0b6ac1784d169060efcd9fb77d564477038eb09bb4e1ce",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "17211941bb2fa43d54d9fa5907243642bfd805201c130c8600566720cf87562011f0872598f1e69cfe541bb864de7ed68201e0a34284157b581984dab3fe2cb0f20cb80d0046740df3e149ec4c92c0e81f2dc439a6f3a05c5ef505eae6308b301c673cfa",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "17211941bb2fa43d54d9fa5907243642baf08c837003bf24d7b81a911ce41bd31de8a92f6dc6d11135b70c73ea167c3fc4ea78234f58652d25e23245dbcb895bf4165092d0515ae8f14230f8a34b06957f24ba4b24db741490e7edcd6e5310945cc159fc",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-GCM, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: `5a29debb5c5f38cdf8aee421bd94dbbf3399947faddf205f88b3ad8ecb0c51214ec0e28bf78942dfa212d7eb15259bbdcac677b4c05f473eeb9331d74f31d441d97d56eb5c73b586342d72128ca528813543dc0fc7eddb7477172cc9194c18b2e1383e4e

Tag: 70fad2ca19412c20f40fd06918736e56`,
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-128-ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "869c057637a58cc3363bcc4bcfa62702abf85dff44300eb9fdcfb9d845772c8acb557c8d540baae2489c6758abef83d81b74239bef87c6c944c1b00ca160882bc15be9a6a3de4e6a50a2eab8b635c634027ed7eae4c1d2f08477c38b7dc24f6915da235bc3051f3a50736b14db8863e4",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "1aec90cd7f629ef68243881f3e2b793a548cbcdad69631995a6bd0c8aea1e948d8a5f3f2b7e7f9b77da77434c92a6257a9f57e937b883f4400511b990888a0b1d27c0a4b7f298e6f50b563135edc9fa7d8eceb6bc8163e6153a20cf07aa1e705bc5cb3a37b0452b4019cef8000d7c1b7",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "fc370a6c013b3c05430fbce810cb97d39cb0a587320a4c1b57d0c0d08e93cb0d1221abba9df09b4b1332ce923b289f92000e6b4f7fbc55dfdab9179081d8c36ef4a0e3d3a49f1564715c5d3e88f8bf6d3dd77944f22f99a03b5535a3cd47bc44d4a9665c",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "fc370a6c013b3c05430fbce810cb97d33605d11b2531c8833bc3e818003bbd7dd58b2a38d10d44d25d11bd96228b264a4d2aad1d0a7af2cfad0e70c1ade305433e95cb0ee693447f6877a59a4be5c070d19afba23ff10caf5ecfa7a9c2877b8df23d61f2",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "fc370a6c013b3c05430fbce810cb97d340525303ae59c5e9b73ad5ff3e65ce3abf00431e0a292d990f732a397de589420827beb1c28623c56972eb2ddf0cf3f82e3c30e155df7f64a530419c28fc51a9091c73df78e73958bee1d1acd8676c9c0f1915ca",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-GCM, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: `318b479d919d506f0cd904f2676fab263a7921b6d7e0514f36e03ae2333b77fa66ef5600babcb2ee9718aeb71fc357412343c1f2cb351d8715bb0aedae4a6468124f9c4aaf6a721b306beddbe63a978bec8baeeba4b663be33ee5bc982746bd4aed1c38b

Tag: 86db597d5302595223cadbd990f1309b`,
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-192-ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "56ef533db50a3b33951a76acede52b7d54fbae7fb07da20daa3e2731e5721ee4c13ab15ac80748c14dece982310530ad65480512a4cf70201473fb7bc3480446bc86b1ff9b4517c4c1f656bc236fab1aca276ae5af25f5871b671823f3cb3e426da059dd83a13f125bd6cfe600c331b0",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "bc60a7613559e23e8a7be8e98a1459003fdb036f33368d8a30156c51464b49472705a4ddae05da96956ce058bb180dd301c5fd58bf6a2ded0d7dd4da85fd5ba43a4297691532bf7f4cd92bfcfd3704faf2f9bd5425049b34433ba90fb85c80646e6cb09ee4e4059e7cd753a2fef8bbad",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "5dc73709da5cb0ac914ae4bcb621fd75169eac5ff13a2dde573f6380ff812e8ddb58f0e9afaec1ff0d6d2af0659e10c05b714ec97481a15f4a7aeb4c6ea84112ce897459b54ed9e77a794f023f2bef1901f013cf435432fca5fb59e2be781916247d2334",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "5dc73709da5cb0ac914ae4bcb621fd75b6e1f909b88733f784b1df8a52dc200440a1076415d009a7c12cac1e8ab76bdc290e6634cd5bf8a416fda8dcfd7910e55fe9d1148cd85d7a59adad39ab089e111d8f8da246e2e874cf5d9ab7552af6308320a5ab",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "5dc73709da5cb0ac914ae4bcb621fd7591356d4169898c986a90b193f4d1f0d5cba1d10b2bfc5aee8a48dce9dba174cecf56f92dddf7eb306d78360000eea7bcb50f696d84a3757a822800ed68f9edf118dc61406bacf64f022717d8cb6010049bf75d7e",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-GCM, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: `1287f188ad4d7ab0d9ff69b3c29cb11f861389532d8cb9337181da2e8cfc74a84927e8c0dd7a28a32fd485afe694259a63c199b199b95edd87c7aa95329feac340f2b78b72956a85f367044d821766b1b7135815571df44900695f1518cf3ae38ecb650f

Tag: 821b1e5f32dad052e502775a523d957a`,
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Encrypt: AES-256-ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "7e8521ba3f356ef692a51841807e141464aadc07bbc0ef2b628b8745bae356d245682a220688afca7be987b60cb120681ed42680ee93a67065619a3beaac11111a6cd88a6afa9e367722cb57df343f8548f2d691b295184da4ed5f3b763aaa8558502cb348ab58e81986337096e90caa",
        recipeConfig: [
            {
                "op": "AES Encrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Encrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`,
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Encrypt: DES-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "6500defb824b0eb8ccbf1fa9689c6f5bcc65247d93ecb0e573232824bca82dd41e2361f8fd82ef187de9f3b74f7ba3ca2b4e735f3ca6304fb8dd1675933c576424b1ea72b3219bdab62fce56d49c820d5ac02a4702a6d688e90b0933de97da21e4829e5cf85caae8",
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Encrypt: DES-CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "09015087e15b09374bc9edba80ce41e6809e332fc1e988858749fb2f4ebbd6483a6fce01a43271280c07c90e13d517729acac45beef7d088339eb7e084bbbb7459fc8bb592d2ca76b90066dc79b1fbc5e016208e1d02c6e48ab675530f8040e53e1a138b",
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Encrypt: DES-OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "09015087e15b09374d8879bac14dbad851dd08fb131353a8c510acc4570e97720dd159465f1c7da3cac4a50521e1c1ab87e8cf5b0aa0c1d2eaa8a1ed914a26c13b2b0a76a368f08812fc7fa4b7c047f27df0c35e5f53b8a20e2ffc10e55d388cae8070db",
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        // play.golang.org/p/4Qm2hfLGsqc
        name: "DES Encrypt: DES-CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "09015087e15b0937c462fd5974af0c4b5880de136a5680453c99f4500628cbeca769623515d836985110b93eacfea7fa4a7b2b3cb4f67acbb5f7e8ddb5a5d445da74bf6572b0a874befa3888c81110776388e400afd8dc908dcc0c018c7753355f8a1c9f",
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Encrypt: DES-ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "8dea4c6a35d5f6a419232159a0b039798d0a0b20fd1e559b1d04f8eb1120e8bca6ed5b3a4bc2b23d3b62312e6085d9e837677569fe79a65eba7cb4a2969e099fc1bd649e9c8aeb2c4c519e085db6974819257c20fde70acabc976308cc41635038c91acf5eefff1e",
        recipeConfig: [
            {
                "op": "DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Encrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

Triple DES uses a key length of 24 bytes (192 bits).
DES uses a key length of 8 bytes (64 bits).`,
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Encrypt: DES-EDE3-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "f826c9116ea932eb7027a810b5ce21109c4ef2563c9f3ba5e2518f72484e88f8d3f6ff3f334f64bb6bb9ff91b70f6f29c037b10dee5fe16d7f0f41c9a7ecdd83f113a1dd66ab70783ee458c2366bf5fbc016f7c168c43c11d607692a3280e3750a6154a86b62c48d",
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Encrypt: DES-EDE3-CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "874d32cd7bdae52c3690875e265a2fac7ced685e5ec4436a6bb5a5c18be185f4526683a5bc7ae86f00523034fb725ab4c8285a6967ccca1b76f6331718c26e12ea67fc924071f81ce0035a9dd31705bcd6467991cae5504d70424e6339459db5b33cbc8a",
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Encrypt: DES-EDE3-OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "874d32cd7bdae52c8f61672860f715d14819c0270320a8ad71083b38bd8954bbada3c77af641590b00a678524d748668fe3dfa83f71835c411cdbdd8e73a70656324b7faaba16e1d8dba260d8f965fe7a91110134c19076f1eeb46393038c22c559fe490",
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        // play.golang.org/p/RElT6pVeNz2
        name: "Triple DES Encrypt: DES-EDE3-CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "874d32cd7bdae52cd8630d3ab2bf373e7110e13713caa6a8bfed9d9dd802d0ebe93128ac0d0f05abcc56237b75fb69207dba11e68ddc4b0118a4c75e7248bbd80aaba4dd4436642546ec6ca7fa7526f3b0018ed5194c409dc2c1484530b968af554984f3",
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Encrypt: DES-EDE3-ECB Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "aa81f23d1b3abebd68ac560e051a711c2923843beecddb0f7fe4113bd1874e73cccf3a2a494bb011e154ca2737b4d0eb5978a10316361074ed368d85d5aff5c8555ea101b0a468e58780a74c7830c561674c183c972a2b48931adf789cb16df304e169500f8c95ad",
        recipeConfig: [
            {
                "op": "Triple DES Encrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`,
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CBC with IV0, ASCII",
        input: "2ef6c3fdb1314b5c2c326a2087fe1a82d5e73bf605ec8431d73e847187fc1c8fbbe969c177df1ecdf8c13f2f505f9498",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    "CBC", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CTR with IV0, ASCII",
        input: "a98c9e8e3b7c894384d740e4f0f4ed0be2bbb1e0e13a255812c3c6b0a629e4ad759c075b2469c6f4fb2c0cf9",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00000000000000000000000000000000"},
                    "CTR", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CBC with IV, ASCII",
        input: "4fa077d50cc71a57393e7b542c4e3aea0fb75383b97083f2f568ffc13c0e7a47502ec6d9f25744a061a3a5e55fe95e8d",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CBC", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CFB, ASCII",
        input: "369e1c9e5a85b0520f3e61eecc37759246ad0a02cae7a99a3d250ae39cad4743385375cf63720d52ae8cdfb9",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CFB", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-OFB, ASCII",
        input: "369e1c9e5a85b0520f3e61eecc37759288cb378c5fa9c675bd6c4ede0ae6a925eaebc8e0a6162d2a000ddc0f",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "OFB", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CTR, ASCII",
        input: "369e1c9e5a85b0520f3e61eecc37759206f6f1ba63527af96fae3b15a921844df2e542902a4f0525dbb4146b",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    "CTR", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-ECB, ASCII",
        input: "2ef6c3fdb1314b5c2c326a2087fe1a8238c5a5db7dff38f6f4eb75b2e55cab3d8d6113eb8d3517223b4545fcdb4c5a48",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": ""},
                    "ECB", "Hex", "Raw",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-GCM, ASCII",
        input: "d0bcace0fa3a214b0ac3cbb4ac2caaf97b965f172f66d2a4ec6304a15a4072f1b28a6f9b80473f86bfa47b2c",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "00112233445566778899aabbccddeeff"},
                    {"option": "Hex", "string": ""},
                    "GCM", "Hex", "Raw",
                    {"option": "Hex", "string": "16a3e732a605cc9ca29108f742ca0743"}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CBC, Binary",
        input: "bf2ccb148e5df181a46f39764047e24fc94cc46bbe6c8d160fc25a977e4b630883e9e04d3eeae3ccbb2d57a4c22e61909f2b6d7b24940abe95d356ce986294270d0513e0ffe7a9928fa6669e1aaae4379310281dc27c0bb9e254684b2ecd7f5f944c8218f3bc680570399a508dfe4b65",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CFB, Binary",
        input: "17211941bb2fa43d54d9fa59072436422a55be7a2be164cf5ec4e50e7a0035094ab684dab8d45a4515ae95c4136ded98898f74d4ecc4ac57ae682a985031ecb7518ddea6c8d816349801aa22ff0b6ac1784d169060efcd9fb77d564477038eb09bb4e1ce",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-OFB, Binary",
        input: "17211941bb2fa43d54d9fa5907243642bfd805201c130c8600566720cf87562011f0872598f1e69cfe541bb864de7ed68201e0a34284157b581984dab3fe2cb0f20cb80d0046740df3e149ec4c92c0e81f2dc439a6f3a05c5ef505eae6308b301c673cfa",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-CTR, Binary",
        input: "17211941bb2fa43d54d9fa5907243642baf08c837003bf24d7b81a911ce41bd31de8a92f6dc6d11135b70c73ea167c3fc4ea78234f58652d25e23245dbcb895bf4165092d0515ae8f14230f8a34b06957f24ba4b24db741490e7edcd6e5310945cc159fc",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-GCM, Binary",
        input: "5a29debb5c5f38cdf8aee421bd94dbbf3399947faddf205f88b3ad8ecb0c51214ec0e28bf78942dfa212d7eb15259bbdcac677b4c05f473eeb9331d74f31d441d97d56eb5c73b586342d72128ca528813543dc0fc7eddb7477172cc9194c18b2e1383e4e",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex",
                    {"option": "Hex", "string": "70fad2ca19412c20f40fd06918736e56"}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-128-ECB, Binary",
        input: "869c057637a58cc3363bcc4bcfa62702abf85dff44300eb9fdcfb9d845772c8acb557c8d540baae2489c6758abef83d81b74239bef87c6c944c1b00ca160882bc15be9a6a3de4e6a50a2eab8b635c634027ed7eae4c1d2f08477c38b7dc24f6915da235bc3051f3a50736b14db8863e4",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "51e201d463698ef5f717f71f5b4712af"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-CBC, Binary",
        input: "1aec90cd7f629ef68243881f3e2b793a548cbcdad69631995a6bd0c8aea1e948d8a5f3f2b7e7f9b77da77434c92a6257a9f57e937b883f4400511b990888a0b1d27c0a4b7f298e6f50b563135edc9fa7d8eceb6bc8163e6153a20cf07aa1e705bc5cb3a37b0452b4019cef8000d7c1b7",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-CFB, Binary",
        input: "fc370a6c013b3c05430fbce810cb97d39cb0a587320a4c1b57d0c0d08e93cb0d1221abba9df09b4b1332ce923b289f92000e6b4f7fbc55dfdab9179081d8c36ef4a0e3d3a49f1564715c5d3e88f8bf6d3dd77944f22f99a03b5535a3cd47bc44d4a9665c",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-OFB, Binary",
        input: "fc370a6c013b3c05430fbce810cb97d33605d11b2531c8833bc3e818003bbd7dd58b2a38d10d44d25d11bd96228b264a4d2aad1d0a7af2cfad0e70c1ade305433e95cb0ee693447f6877a59a4be5c070d19afba23ff10caf5ecfa7a9c2877b8df23d61f2",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-CTR, Binary",
        input: "fc370a6c013b3c05430fbce810cb97d340525303ae59c5e9b73ad5ff3e65ce3abf00431e0a292d990f732a397de589420827beb1c28623c56972eb2ddf0cf3f82e3c30e155df7f64a530419c28fc51a9091c73df78e73958bee1d1acd8676c9c0f1915ca",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-GCM, Binary",
        input: "318b479d919d506f0cd904f2676fab263a7921b6d7e0514f36e03ae2333b77fa66ef5600babcb2ee9718aeb71fc357412343c1f2cb351d8715bb0aedae4a6468124f9c4aaf6a721b306beddbe63a978bec8baeeba4b663be33ee5bc982746bd4aed1c38b",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex",
                    {"option": "Hex", "string": "86db597d5302595223cadbd990f1309b"}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-192-ECB, Binary",
        input: "56ef533db50a3b33951a76acede52b7d54fbae7fb07da20daa3e2731e5721ee4c13ab15ac80748c14dece982310530ad65480512a4cf70201473fb7bc3480446bc86b1ff9b4517c4c1f656bc236fab1aca276ae5af25f5871b671823f3cb3e426da059dd83a13f125bd6cfe600c331b0",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "6801ed503c9d96ee5f9d78b07ab1b295dba3c2adf81c7816"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-CBC, Binary",
        input: "bc60a7613559e23e8a7be8e98a1459003fdb036f33368d8a30156c51464b49472705a4ddae05da96956ce058bb180dd301c5fd58bf6a2ded0d7dd4da85fd5ba43a4297691532bf7f4cd92bfcfd3704faf2f9bd5425049b34433ba90fb85c80646e6cb09ee4e4059e7cd753a2fef8bbad",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CBC", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-CFB, Binary",
        input: "5dc73709da5cb0ac914ae4bcb621fd75169eac5ff13a2dde573f6380ff812e8ddb58f0e9afaec1ff0d6d2af0659e10c05b714ec97481a15f4a7aeb4c6ea84112ce897459b54ed9e77a794f023f2bef1901f013cf435432fca5fb59e2be781916247d2334",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-OFB, Binary",
        input: "5dc73709da5cb0ac914ae4bcb621fd75b6e1f909b88733f784b1df8a52dc200440a1076415d009a7c12cac1e8ab76bdc290e6634cd5bf8a416fda8dcfd7910e55fe9d1148cd85d7a59adad39ab089e111d8f8da246e2e874cf5d9ab7552af6308320a5ab",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "OFB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-CTR, Binary",
        input: "5dc73709da5cb0ac914ae4bcb621fd7591356d4169898c986a90b193f4d1f0d5cba1d10b2bfc5aee8a48dce9dba174cecf56f92dddf7eb306d78360000eea7bcb50f696d84a3757a822800ed68f9edf118dc61406bacf64f022717d8cb6010049bf75d7e",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "CTR", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-GCM, Binary",
        input: "1287f188ad4d7ab0d9ff69b3c29cb11f861389532d8cb9337181da2e8cfc74a84927e8c0dd7a28a32fd485afe694259a63c199b199b95edd87c7aa95329feac340f2b78b72956a85f367044d821766b1b7135815571df44900695f1518cf3ae38ecb650f",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "GCM", "Hex", "Hex",
                    {"option": "Hex", "string": "821b1e5f32dad052e502775a523d957a"}
                ]
            }
        ],
    },
    {
        name: "AES Decrypt: AES-256-ECB, Binary",
        input: "7e8521ba3f356ef692a51841807e141464aadc07bbc0ef2b628b8745bae356d245682a220688afca7be987b60cb120681ed42680ee93a67065619a3beaac11111a6cd88a6afa9e367722cb57df343f8548f2d691b295184da4ed5f3b763aaa8558502cb348ab58e81986337096e90caa",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "AES Decrypt",
                "args": [
                    {"option": "Hex", "string": "2d767f6e9333d1c77581946e160b2b7368c2cdd5e2b80f04ca09d64e02afbfe1"},
                    {"option": "Hex", "string": "1748e7179bd56570d51fa4ba287cc3e5"},
                    "ECB", "Hex", "Hex",
                    {"option": "Hex", "string": ""}
                ]
            }
        ],
    },
    {
        name: "DES Decrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`,
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Decrypt: DES-CBC, Binary",
        input: "6500defb824b0eb8ccbf1fa9689c6f5bcc65247d93ecb0e573232824bca82dd41e2361f8fd82ef187de9f3b74f7ba3ca2b4e735f3ca6304fb8dd1675933c576424b1ea72b3219bdab62fce56d49c820d5ac02a4702a6d688e90b0933de97da21e4829e5cf85caae8",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Decrypt: DES-CFB, Binary",
        input: "09015087e15b09374bc9edba80ce41e6809e332fc1e988858749fb2f4ebbd6483a6fce01a43271280c07c90e13d517729acac45beef7d088339eb7e084bbbb7459fc8bb592d2ca76b90066dc79b1fbc5e016208e1d02c6e48ab675530f8040e53e1a138b",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Decrypt: DES-OFB, Binary",
        input: "09015087e15b09374d8879bac14dbad851dd08fb131353a8c510acc4570e97720dd159465f1c7da3cac4a50521e1c1ab87e8cf5b0aa0c1d2eaa8a1ed914a26c13b2b0a76a368f08812fc7fa4b7c047f27df0c35e5f53b8a20e2ffc10e55d388cae8070db",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        // play.golang.org/p/FpvqncmPk7R
        name: "DES Decrypt: DES-CTR, Binary",
        input: "09015087e15b0937ab0ae5a84d66e520893690a6ea066382bf1330e8876cb3aa82ccc634f8f0d458bbe0257df6f4637cdac89f311168ba91208a21ba4bdd13c4b1a92cb93b33364b5b94a5d3d7fba68f6eed5807d9f5afeb7fbffcd94792131d264004ae",
        expectedOutput: "7a0e643132750e96b76dc9efa7810bea2b8feaa5b97887e44f96c0e6d506cc4dd4665683c6f63139221f8d887fd0a05b39741f8a67d87d6ac6f8dc6b668bd3e4a97b8bd3a19eafd5cdf50c3e1b3f17d61087d0b67cf6db31fec338b75f5954942c852829",
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "DES Decrypt: DES-ECB, Binary",
        input: "8dea4c6a35d5f6a419232159a0b039798d0a0b20fd1e559b1d04f8eb1120e8bca6ed5b3a4bc2b23d3b62312e6085d9e837677569fe79a65eba7cb4a2969e099fc1bd649e9c8aeb2c4c519e085db6974819257c20fde70acabc976308cc41635038c91acf5eefff1e",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "58345efb0a64e87e"},
                    {"option": "Hex", "string": "533ed1378bfd929e"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Decrypt: no key",
        input: "",
        expectedOutput: `Invalid key length: 0 bytes

Triple DES uses a key length of 24 bytes (192 bits).
DES uses a key length of 8 bytes (64 bits).`,
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Decrypt: DES-EDE3-CBC, Binary",
        input: "f826c9116ea932eb7027a810b5ce21109c4ef2563c9f3ba5e2518f72484e88f8d3f6ff3f334f64bb6bb9ff91b70f6f29c037b10dee5fe16d7f0f41c9a7ecdd83f113a1dd66ab70783ee458c2366bf5fbc016f7c168c43c11d607692a3280e3750a6154a86b62c48d",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CBC", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Decrypt: DES-EDE3-CFB, Binary",
        input: "874d32cd7bdae52c3690875e265a2fac7ced685e5ec4436a6bb5a5c18be185f4526683a5bc7ae86f00523034fb725ab4c8285a6967ccca1b76f6331718c26e12ea67fc924071f81ce0035a9dd31705bcd6467991cae5504d70424e6339459db5b33cbc8a",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Decrypt: DES-EDE3-OFB, Binary",
        input: "874d32cd7bdae52c8f61672860f715d14819c0270320a8ad71083b38bd8954bbada3c77af641590b00a678524d748668fe3dfa83f71835c411cdbdd8e73a70656324b7faaba16e1d8dba260d8f965fe7a91110134c19076f1eeb46393038c22c559fe490",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "OFB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        // play.golang.org/p/iBacN9kX_RO
        name: "Triple DES Decrypt: DES-EDE3-CTR, Binary",
        input: "874d32cd7bdae52c254687e2d7e7093b077af2ec70878f99315f52a21ded5fb10c80a47e6271384335ac47376c758f675484fd7b8be9568aaec643f0d15cffdf3fe54ef3a1b2da50d5d8c7994d7a4a94e0a13a4d437443f0f1f39e93dd13ff06a80c66e4",
        expectedOutput: "7a0e643132750e9625205bc6fb10dc848c53b7cb5a654d1242aecb6191ad3b5114727e5044a0ee11311575873c54829a80f9471ac473a0bbe5e791a23be75062f7e8f2210d998f9fbbaf3a5bb3dacd494d42d82950e3ab273f821eb979168315a80ad20f",
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "CTR", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "Triple DES Decrypt: DES-EDE3-ECB, Binary",
        input: "aa81f23d1b3abebd68ac560e051a711c2923843beecddb0f7fe4113bd1874e73cccf3a2a494bb011e154ca2737b4d0eb5978a10316361074ed368d85d5aff5c8555ea101b0a468e58780a74c7830c561674c183c972a2b48931adf789cb16df304e169500f8c95ad",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Triple DES Decrypt",
                "args": [
                    {"option": "Hex", "string": "190da55fb54b9e7dd6de05f43bf3347ef203cd34a5829b23"},
                    {"option": "Hex", "string": "14f67ac044a84da6"},
                    "ECB", "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Encrypt: no key",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "d3644d898b51a544f690b506c3fd0caeb7a1e6097f7ea28f69b909a4d8805c9a05f4cade8b281d3f044fa069374efb90e94723622c86afc17caee394ffbee0abe627de299208460eb981c9d56f9df885091c6c89e2ee173264b2820b8e67675214e6545a05dc0d3f",
        recipeConfig: [
            {
                "op": "RC2 Encrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Encrypt: RC2-CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "d25e5bc6c9311ef196d6f21cc4b0274b29fcca366aba5256406e02bf4ae628398f84e7d72ad92025ede76df4752d1510fe9c3492efb1dcf0be2cd41d619e10b9dd5a2304c2efbd3598d3b87f1a21f326d45e65537563436cfb6e4a41ec3733182ddc058f96f74a6c",
        recipeConfig: [
            {
                "op": "RC2 Encrypt",
                "args": [
                    {"option": "Hex", "string": "eb970554bb213430f4bb4e5988a6a218"},
                    {"option": "Hex", "string": "ae817c784a097e0c"},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Encrypt: RC2-ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "a160bf23b2a85eaa43d26753e51aaa899f162ec0da7280fffd41b705c5309c7fef2bbb56bf261cab4eadd3a5c69e0a67d45e426d1097187cc9a959b4d979a9d40df26f3dc8d030453fe27701438b78d3ce044330b4b5dca7832537ecf40b914f1b1dc16d4e6d7229",
        recipeConfig: [
            {
                "op": "RC2 Encrypt",
                "args": [
                    {"option": "Hex", "string": "eb970554bb213430f4bb4e5988a6a218"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Decrypt: no key",
        input: "d3644d898b51a544f690b506c3fd0caeb7a1e6097f7ea28f69b909a4d8805c9a05f4cade8b281d3f044fa069374efb90e94723622c86afc17caee394ffbee0abe627de299208460eb981c9d56f9df885091c6c89e2ee173264b2820b8e67675214e6545a05dc0d3f",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "RC2 Decrypt",
                "args": [
                    {"option": "Hex", "string": ""},
                    {"option": "Hex", "string": ""},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Decrypt: RC2-CBC, Binary",
        input: "d25e5bc6c9311ef196d6f21cc4b0274b29fcca366aba5256406e02bf4ae628398f84e7d72ad92025ede76df4752d1510fe9c3492efb1dcf0be2cd41d619e10b9dd5a2304c2efbd3598d3b87f1a21f326d45e65537563436cfb6e4a41ec3733182ddc058f96f74a6c",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "RC2 Decrypt",
                "args": [
                    {"option": "Hex", "string": "eb970554bb213430f4bb4e5988a6a218"},
                    {"option": "Hex", "string": "ae817c784a097e0c"},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    {
        name: "RC2 Decrypt: RC2-ECB, Binary",
        input: "a160bf23b2a85eaa43d26753e51aaa899f162ec0da7280fffd41b705c5309c7fef2bbb56bf261cab4eadd3a5c69e0a67d45e426d1097187cc9a959b4d979a9d40df26f3dc8d030453fe27701438b78d3ce044330b4b5dca7832537ecf40b914f1b1dc16d4e6d7229",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "RC2 Decrypt",
                "args": [
                    {"option": "Hex", "string": "eb970554bb213430f4bb4e5988a6a218"},
                    {"option": "Hex", "string": ""},
                    "Hex", "Hex"
                ]
            }
        ],
    },
    /* The following expectedOutputs are generated with this Python script with pyCryptoDome
    from Crypto.Cipher import Blowfish
    import binascii

    input_data = b"The quick brown fox jumps over the lazy dog."
    key = binascii.unhexlify("0011223344556677")
    iv = binascii.unhexlify("0000000000000000")
    mode = Blowfish.MODE_CBC

    if mode == Blowfish.MODE_ECB or mode == Blowfish.MODE_CBC:
        padding_len = 8-(len(input_data) & 7)
        for i in range(padding_len):
            input_data += bytes([padding_len])

    cipher = Blowfish.new(key, mode)  # set iv, nonce, segment_size etc. here
    cipher_text = cipher.encrypt(input_data)

    cipher_text = binascii.hexlify(cipher_text).decode("UTF-8")

    print("Encrypted: {}".format(cipher_text))
*/
    {
        name: "Blowfish Encrypt: ECB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "f7784137ab1bf51546c0b120bdb7fed4509116e49283b35fab0e4292ac86251a9bf908330e3393815e3356bb26524027",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // IV
                    "ECB", // Mode
                    "Raw", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: ECB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "3d1bf0e87d83782d435a0ca58179ca290184867f52295af5c0fb4dcac7c6c68942906bb421d05925cc7d9cd21532376a0f6ae4c3f008b250381ffa9624f5eb697dbd44de48cf5593ea7dbf5842238474b546ceeb29f6cf327a7d13698786b8d14451f52fb0f5760a",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // IV
                    "ECB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: ECB, ASCII",
        input: "f7784137ab1bf51546c0b120bdb7fed4509116e49283b35fab0e4292ac86251a9bf908330e3393815e3356bb26524027",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // IV
                    "ECB", // Mode
                    "Hex", // Input
                    "Raw" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: ECB, Binary",
        input: "3d1bf0e87d83782d435a0ca58179ca290184867f52295af5c0fb4dcac7c6c68942906bb421d05925cc7d9cd21532376a0f6ae4c3f008b250381ffa9624f5eb697dbd44de48cf5593ea7dbf5842238474b546ceeb29f6cf327a7d13698786b8d14451f52fb0f5760a",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "0000000000000000"}, // IV
                    "ECB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CBC, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "398433f39e938286a35fc240521435b6972f3fe96846b54ab9351aa5fa9e10a6a94074e883d1cb36cb9657c817274b60",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CBC", // Mode
                    "Raw", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CBC, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "3b42c51465896524e66c2fd2404c8c2b4eb26c760671f131c3372d374f48283ca9a5404d3d8aabd2a886c6551393ca41c682580f1c81f16046e3bec7b59247bdfca1d40bf2ad8ede9de99cb44b36658f775999d37776b3b1a085b9530e54ece69e1875e1bdc8cdcf",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CBC", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CBC, ASCII",
        input: "398433f39e938286a35fc240521435b6972f3fe96846b54ab9351aa5fa9e10a6a94074e883d1cb36cb9657c817274b60",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CBC", // Mode
                    "Hex", // Input
                    "Raw" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CBC, Binary",
        input: "3b42c51465896524e66c2fd2404c8c2b4eb26c760671f131c3372d374f48283ca9a5404d3d8aabd2a886c6551393ca41c682580f1c81f16046e3bec7b59247bdfca1d40bf2ad8ede9de99cb44b36658f775999d37776b3b1a085b9530e54ece69e1875e1bdc8cdcf",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CBC", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CFB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        // pyCryptoDome produces a different value with default settings. This is due to segment_size having
        // a default value of 8 bits. Setting it to 64 (one full block) will yield the same result.
        expectedOutput: "c8ca123592570c1fcb138d4ec08f7af14ad49363245be1ac25029c8ffc508b3217e75faaa5566426180fec8f",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CFB", // Mode
                    "Raw", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        // see above. pyCryptoDome produeces a different value with its default settings
        expectedOutput: "e6ac1324d1576beab00e855de3f4ac1f5e3cbf89f4c2a743a5737895067ac5012e5bdb92477e256cc07bf691b58e721179b550e694abb0be7cbdc42586db755bf795f4338f47d356c57453afa6277e46aaeb3405f9744654a477f06c2ad92ede90555759",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CFB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CFB, ASCII",
        input: "c8ca123592570c1fcb138d4ec08f7af14ad49363245be1ac25029c8ffc508b3217e75faaa5566426180fec8f",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        // see above. pyCryptoDome produeces a different value with its default settings
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CFB", // Mode
                    "Hex", // Input
                    "Raw" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CFB, Binary",
        input: "e6ac1324d1576beab00e855de3f4ac1f5e3cbf89f4c2a743a5737895067ac5012e5bdb92477e256cc07bf691b58e721179b550e694abb0be7cbdc42586db755bf795f4338f47d356c57453afa6277e46aaeb3405f9744654a477f06c2ad92ede90555759",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        // see above. pyCryptoDome produeces a different value with its default settings
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "CFB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: OFB, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "c8ca123592570c1fffcee88b9823b9450dc9c48e559123c1df1984214212bae7e44114d29dba79683d10cce5",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "OFB", // Mode
                    "Raw", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: OFB, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "e6ac1324d1576bea4ceb5be7691c35e4919f18be06cc2a926025ef0973222e987de7c63cd71ed3b19190ba006931d9cbdf412f5b1ac7155904ca591f693fe11aa996e17866e0de4b2eb7ff5effabf94b0f49ed159202caf72745ac2f024d86f942d83767",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "OFB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: OFB, ASCII",
        input: "c8ca123592570c1fffcee88b9823b9450dc9c48e559123c1df1984214212bae7e44114d29dba79683d10cce5",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "OFB", // Mode
                    "Hex", // Input
                    "Raw" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: OFB, Binary",
        input: "e6ac1324d1576bea4ceb5be7691c35e4919f18be06cc2a926025ef0973222e987de7c63cd71ed3b19190ba006931d9cbdf412f5b1ac7155904ca591f693fe11aa996e17866e0de4b2eb7ff5effabf94b0f49ed159202caf72745ac2f024d86f942d83767",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    {"option": "Hex", "string": "ffeeddccbbaa9988"}, // IV
                    "OFB", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CTR, ASCII",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "e2a5e0f03ad4877101c7cf83861ad93477adb57acac4bebc315a7bae34b4e6a54e5532db457a3131dcd9dda6",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    // pyCryptoDome only allows the size of the nonce to be [0,7] bytes.
                    // Internally, it right-pads the nonce to 7 bytes long if it wasn't already 7 bytes,
                    // and the last (8th) byte is used for counter.
                    // Therefore a pyCryptoDome nonce of "aabbccdd" is equivalent to an IV of "aabbccdd00000000" here.
                    {"option": "Hex", "string": "0000000000000000"}, // IV (nonce)
                    "CTR", // Mode
                    "Raw", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Encrypt: CTR, Binary",
        input: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        expectedOutput: "ccc3e1e179d4e084b2e27cef77255595ebfb694a9999b7ef8e661086058472dad7f3e0350fde9be87059ab43d5b800aa08be4c00f3f2e99402fe2702c39e8663dbcbb146700d63432227f1045f116bfd4b65022ca20b70427ddcfd7441cb3c75f4d3fff0",
        recipeConfig: [
            {
                "op": "Blowfish Encrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    // See notes above
                    {"option": "Hex", "string": "0000000000000000"}, // IV (nonce)
                    "CTR", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CTR, ASCII",
        input: "e2a5e0f03ad4877101c7cf83861ad93477adb57acac4bebc315a7bae34b4e6a54e5532db457a3131dcd9dda6",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    // See notes above
                    {"option": "Hex", "string": "0000000000000000"}, // IV (nonce)
                    "CTR", // Mode
                    "Hex", // Input
                    "Raw" // Output
                ]
            }
        ],
    },
    {
        name: "Blowfish Decrypt: CTR, Binary",
        input: "ccc3e1e179d4e084b2e27cef77255595ebfb694a9999b7ef8e661086058472dad7f3e0350fde9be87059ab43d5b800aa08be4c00f3f2e99402fe2702c39e8663dbcbb146700d63432227f1045f116bfd4b65022ca20b70427ddcfd7441cb3c75f4d3fff0",
        expectedOutput: "7a0e643132750e96d805d11e9e48e281fa39a41039286423cc1c045e5442b40bf1c3f2822bded3f9c8ef11cb25da64dda9c7ab87c246bd305385150c98f31465c2a6180fe81d31ea289b916504d5a12e1de26cb10adba84a0cb0c86f94bc14bc554f3018",
        recipeConfig: [
            {
                "op": "Blowfish Decrypt",
                "args": [
                    {"option": "Hex", "string": "0011223344556677"}, // Key
                    // See notes above
                    {"option": "Hex", "string": "0000000000000000"}, // IV (nonce)
                    "CTR", // Mode
                    "Hex", // Input
                    "Hex" // Output
                ]
            }
        ],
    },
]);
