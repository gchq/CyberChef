/**
 * RSA tests.
 *
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {ASCII_TEXT, UTF8_TEXT, ALL_BYTES} from "../../samples/Ciphers.mjs";

const PEM_PRIV_2048 = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAwfaUOpUEutKyU3wkCv6kYunz4MqxzSuTSckRz1IxwZtwIiqq
+ejkM6ioXPyGadfFNvG0JVOgr1q4KQglq0vXaYG57HZ8iinXnHgy1vr8i+fWYITB
RMrEDySaQh3sxVj8NudPDoTIxZwUcIUu/N53pUmI08ADxXPA+ZymPyZhZyxrj5Jq
2O2QuRu+R7K44NDweP/rETbGo5+QAPydm6UqBzTky/ohv6EGhjyqnaskTWwLWK6P
dKva8rEMb8nNJvhoTJDLYUfNjB7DFnWxgWuR/KVkXGAHX99J/wh6QTS+bsyJ2/Mw
Df6NWdh3iP7msLNl/GqL+HunhHjrthvvWlODDwIDAQABAoIBAApKwLvJC3q0UmUO
qcTxlRxwiJHNf5jA7qxUIH9NP7mju1P8ypy/KFi7Ys+oUKOOIPdU5Pe0E8sqN6pp
tcH8oL4G9awf72TPapLxZ9UzdTIhR6VQdgbl8XhSO2M1vkoMejmZlX7SOesOaKE9
1+vwDA43tCx0PF7+UOeN0d549WMphvw3VkSInO/MYpobCGra4YdrhYOhFMyLEGgA
zCyVUOxi538tyyFtK2EEQdcMtvVA6SECjF4xD/qrme0LelIj/L1Uhiu+SOzYt4y+
QLHL6zhJVfOejWxjeI7BhodkTV2D53n4svfizRgyYEb6iLPW3nlMYIlAksYaxxB9
nR3sMHECgYEA9RU+8J5A8RnBcwnlc2X1xEW2PN7+A1MeWPQwFqRwIokgvGbCtwjG
PwwNUYJCTBhfGhsISeCBOSYrDGTHsNH+tqFW2zlq61BolYl56jb1KgWzMOX8dak4
sgXIuBbvyuFNk08VMIzwcA76ka/Iuu/nN9ZOM2UYpdpGG+CTOoIFULECgYEAyppm
I+yAtrUn/BFmwmC8va4vqXlBFjvdkfX/71ywCpHIouLucMV7bILJu0nSCpmL1A7R
DT6qo0p5g+Dxl/+O2VyC5D89PBvcuT1+HtEZGLOoKZnojbSrwDApGbzQi57GoQR6
/SRjsdAmoelY8PFz2s2ZLJ4NkrZXYvkT1Tu8/78CgYEA4MAvC/HUlEWORbTZmk3y
Z5+WU5QbVWkv91tXjiwWOVWPk7aY8ck2JDMlM45ExgvDiuknXLhpSMNbzu3MwraQ
42JpiHjLOChxAFEmYEct5O99OGZwcmZQ+9CaFVfTZzXeMizfvbpB9EGIP3n4lpXS
cD4zUKZxSAc3K/FyksERpsECgYEAhQPXeVBltQ68oKaAE6/VWqcIjbiY/dLyBkk+
7dSpk1bhJefdadaN0NERRtARgXoLrn7Hy21QNILJwsaldwiGrbgqC1Zlipg0Ur3H
ls3rLyeMiTuNzbNHa5dy9H3dYT0t5Tr+0EHa3jvtkTGVfiLX0FhZb0yZVrA2MTmc
RsvAqxsCgYAgXy4qytgfzo5/bBt306NbtMEW3dWBWF77HAz4N1LynKZRUrAAK4rz
BVmXFUaNQOg0q8WJG+iFF79u2UnL8iZ5GoPMcpvifsZgef1OHnQnFrfyXSr0fXIm
xq8eZS0DpLvKGffCW03B9VDRHanE37Tng8lbgOtaufuVzFa1bCuLUA==
-----END RSA PRIVATE KEY-----`;

const PEM_PUB_2048 = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwfaUOpUEutKyU3wkCv6k
Yunz4MqxzSuTSckRz1IxwZtwIiqq+ejkM6ioXPyGadfFNvG0JVOgr1q4KQglq0vX
aYG57HZ8iinXnHgy1vr8i+fWYITBRMrEDySaQh3sxVj8NudPDoTIxZwUcIUu/N53
pUmI08ADxXPA+ZymPyZhZyxrj5Jq2O2QuRu+R7K44NDweP/rETbGo5+QAPydm6Uq
BzTky/ohv6EGhjyqnaskTWwLWK6PdKva8rEMb8nNJvhoTJDLYUfNjB7DFnWxgWuR
/KVkXGAHX99J/wh6QTS+bsyJ2/MwDf6NWdh3iP7msLNl/GqL+HunhHjrthvvWlOD
DwIDAQAB
-----END PUBLIC KEY-----`;

TestRegister.addTests([
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-1, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-1"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-1"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-1, ASCII",
        input: ASCII_TEXT,
        expectedOutput: ASCII_TEXT,
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-1"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-1"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-1, UTF-8",
        input: UTF8_TEXT.substr(0, 100),
        expectedOutput: UTF8_TEXT.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-1"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-1"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-1, All bytes",
        input: ALL_BYTES.substr(0, 100),
        expectedOutput: ALL_BYTES.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-1"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-1"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/MD5, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "MD5"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "MD5"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/MD5, ASCII",
        input: ASCII_TEXT,
        expectedOutput: ASCII_TEXT,
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "MD5"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "MD5"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/MD5, UTF-8",
        input: UTF8_TEXT.substr(0, 100),
        expectedOutput: UTF8_TEXT.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "MD5"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "MD5"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/MD5, All bytes",
        input: ALL_BYTES.substr(0, 100),
        expectedOutput: ALL_BYTES.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "MD5"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "MD5"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-256, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-256"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-256, ASCII",
        input: ASCII_TEXT,
        expectedOutput: ASCII_TEXT,
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-256"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-256, UTF-8",
        input: UTF8_TEXT.substr(0, 100),
        expectedOutput: UTF8_TEXT.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-256"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-256, All bytes",
        input: ALL_BYTES.substr(0, 100),
        expectedOutput: ALL_BYTES.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-256"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-384, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-384"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-384"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-384, ASCII",
        input: ASCII_TEXT,
        expectedOutput: ASCII_TEXT,
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-384"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-384"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-384, UTF-8",
        input: UTF8_TEXT.substr(0, 80),
        expectedOutput: UTF8_TEXT.substr(0, 80),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-384"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-384"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-384, All bytes",
        input: ALL_BYTES.substr(0, 100),
        expectedOutput: ALL_BYTES.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-384"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-384"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-512, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-512"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-512"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-512, ASCII",
        input: ASCII_TEXT.substr(0, 100),
        expectedOutput: ASCII_TEXT.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-512"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-512"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-512, UTF-8",
        input: UTF8_TEXT.substr(0, 60),
        expectedOutput: UTF8_TEXT.substr(0, 60),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-512"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-512"]
            }
        ]
    },
    {
        name: "RSA Encrypt/Decrypt: RSA-OAEP/SHA-512, All bytes",
        input: ALL_BYTES.substr(0, 100),
        expectedOutput: ALL_BYTES.substr(0, 100),
        recipeConfig: [
            {
                "op": "RSA Encrypt",
                "args": [PEM_PUB_2048, "RSA-OAEP", "SHA-512"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-512"]
            }
        ]
    },
    {
        name: "RSA Sign/Verify: SHA-256 round trip",
        input: "Hello, World!",
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "RSA Sign",
                "args": [PEM_PRIV_2048, "", "SHA-256"]
            },
            {
                "op": "RSA Verify",
                "args": [PEM_PUB_2048, "Hello, World!", "Raw", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Verify: valid PKCS#1 v1.5 signature",
        input: "8d7e39505b40c05e62adac1888a9515fd9c233cb5a4741509dce1fd1938baf174301c07150afef241f9dae27f328d439cc18cff4cd774aff73f2840a9e33f2333ae05e80c84e76170906ad2a74bb19a9f6199134faa480b34c9a49bef510732643a0b2eff8f2b861c94a962f5fe3683ff5291ffc8703de7b55fe647f19b28758b9866ce5955404aac82dc60bf4465d1c6a4d3f04721dbed7c05d725f0d01966ecf1b5f50422f327f3b3299dc2de7834a240c10bf0da5c0081adfee6a7e4acbfa4bc9d109db61dd3e7344dd60a39271c5c3d3dc32cc7a3b29dcb924cadec8cb269cc207171ad78e478351ea58daeea81218043bc8095fa90b0fc14380fcd3c391",
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Verify",
                "args": [PEM_PUB_2048, "Hello, World!", "Raw", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Verify: wrong message",
        input: "8d7e39505b40c05e62adac1888a9515fd9c233cb5a4741509dce1fd1938baf174301c07150afef241f9dae27f328d439cc18cff4cd774aff73f2840a9e33f2333ae05e80c84e76170906ad2a74bb19a9f6199134faa480b34c9a49bef510732643a0b2eff8f2b861c94a962f5fe3683ff5291ffc8703de7b55fe647f19b28758b9866ce5955404aac82dc60bf4465d1c6a4d3f04721dbed7c05d725f0d01966ecf1b5f50422f327f3b3299dc2de7834a240c10bf0da5c0081adfee6a7e4acbfa4bc9d109db61dd3e7344dd60a39271c5c3d3dc32cc7a3b29dcb924cadec8cb269cc207171ad78e478351ea58daeea81218043bc8095fa90b0fc14380fcd3c391",
        expectedOutput: "Verification Failure",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Verify",
                "args": [PEM_PUB_2048, "Hello, World?", "Raw", "SHA-256"]
            }
        ]
    },
    {
        // GHSA-86w9-cpqp-85rv: the signature encodes a DigestInfo whose
        // AlgorithmIdentifier carries an extra element. node-forge accepts it.
        name: "RSA Verify: rejects DigestInfo with extra AlgorithmIdentifier elements",
        input: "717ace30b3c1125d6bd03652c826487ea6a55ef95f55ac75bc16df066295ec7ac09ec6f0646c397bc9c3efdb20bd65b00cd8e0aba93a2c536135f593225361564e5dafb731f4735c143d73559586964359d02d3340b9cf21804a9f4c799c7a1ee87992e30f0404d08ba3fa0632ba65f0617a414968a8753feab1ad0ad70f5552709f86812fa006eb3cb64feeb4b470064f4afe542319e1647dccc69d20ffaa0396e29377a84c4aa17a7627441f8a120858d24563277e01d478e9f51eeb22892ca45785f10302c556115dcacac3b4401a5c793b4e79911f0a80961f68eb39dbec5c0355f9852fcdb317cee58acc4b6bdfac591eeb37a71c0b1c2763fbf7f0acc5",
        expectedOutput: "Verification Failure",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Verify",
                "args": [PEM_PUB_2048, "Hello, World!", "Raw", "SHA-256"]
            }
        ]
    },
    {
        name: "RSA Verify: signature length mismatch",
        input: "00010203",
        expectedOutput: "Signature length (4) does not match expected length based on key (256).",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Verify",
                "args": [PEM_PUB_2048, "Hello, World!", "Raw", "SHA-256"]
            }
        ]
    },
]);
