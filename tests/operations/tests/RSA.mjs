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
        name: "RSA Decrypt: binary OAEP/SHA-256 from hex",
        input: "8ebbe3e4c6315eb6791b674e969d560a7600697b268e08c92a75c2ddb37792b5e1aaa0bc011c15167e50c1af8ca7842e2025761d93e77860a26ee912ebba2f35e9a7ab183a64357bdd96c06032992b709b80cb601a23d80f282369a1c171f277a92e7ea62b6f5892633ea51fe64d720fe879402ce48065e8ea0ae280236aa32ceae5dcb60585a219b6af236b2afe868fdedb6c8d3674745c303f256c23f25d0a40e322e59bb7dfb0e010d8a83ac8c24f1df31282a3f100fb5d264ace4b17b6b4d763dfbde71b2f68258d7906e4c30346d249dd60f991e3766e0cfdd6aa0b544f71c2a65621b0436cca57ac6d5af12aae07e1346d289539475336a4f4b047f0e2",
        expectedOutput: "f89766d163f006af7d37beeee64ae9e2b071abb64fe2e2fb36e8e49ee7b5b061",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_2048, "", "RSA-OAEP", "SHA-256"]
            },
            {
                "op": "To Hex",
                "args": ["None", 0]
            }
        ]
    },
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
]);
