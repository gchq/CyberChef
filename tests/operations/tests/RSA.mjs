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

const PEM_PRIV_OAEP_SHA256 = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBkZUqED7P4Twf
FwwtkW45z2QYpJSfKtwlakSeanlRODnrENaAUf1qhX0jS/E0yczTwCG+NoKFOLLm
XkXYy6krTzE3BVtR40gg9EvqUAOyoiDAOlbs2mhpydxOaqllIYGUO81z3hyjc66g
B0+MlFlOLzZ08QWtQVjER4rFGuGSvNwG1cwCtvN1jTiPAdfU/W9t1ggvWzpwK18y
Np2tw3vm1QUV+ULtcViD4GrJQbKRMLVvD9YAc+aELStqZYiQ0yWVlRPpF07qq/p7
lWfGau91wWlHviHTPEW4BgugX8vTibuOJNUp54RGuN1S9A137cDMg1SHalcyjcua
iQ77Jp0PAgMBAAECggEACFemZpwxoNLzvOFI6JPafMpX5Yn+T8fQmho03+D13o6+
TEe6/ufJtLQRGxrUR/KkjcG7ko+V23kAmNYaS4gnf9LXa6gi8eoKO0VcGjqdli7P
m4lIIsgc9OY6xPRq3Y1uoL1dEu/RKyg6r/Hwtz3ThX+aaLrUhE2LLlZpACqy6xh+
bRpzhgelnPaJ9mAXzJr0nEYOqC/7nyBWNGICrknTWZuE04hKhrLI7UmmiIKmZF5f
SCW3LuTp2cjyVJm1hcNnmnJTUkAwApEpSsSxFvjhK1bRoxbCsnBGIIrO8o6MCZf3
NhI17PbY/8yy2GWXewfvXhyuagP0xUy8zKXY/8upeQKBgQDnocLDLW5D7aZYuwCs
XhotHIDOMhgDMRPpPoBt8JkEa5geHWbS6cNS51A8hi7lXSLvCfWFQ5cGTwxTyFRN
GHCIuHhC1U6wd1XP3Xi3hIdljIxV7Q8PuZ9CJlHC9/Cu8SjwVUTrGt7EhkYiMgK7
7dkIwVz60KuwqeWy0aTcy/KDaQKBgQDV7rcp9k4cX8gn2IgFBFi/mbxJDtVK0Fa9
WlY+NqmGcTwMFOKN1ZvWkK7U7RbMYsw7W7jlxyQjcOu4LaR1Y4uuxxg3ID7ItXwn
0HYom0IaotR11ovsbEaKrZSbjmwRZ/l8ruOhcZ7vdT+CPwoSt8TVOVL8bpxRrQAv
f9NqRliltwKBgG6SnLu5UzrgFpmi42ZlIY/JXH+SED5tzjh42qwgv5sJlbtCg9RJ
PTG1NGtADuD0/fkoQukT4+NiFttj9UI8WXQaw2X8F61Luk4ZRkgs3smON2vJV3hF
Pw4/5qXw4BdTDhz0R4sH77HW+2HVh9KYbxOr4qvksyEJaZpcU5wHS8SJAoGARTnc
7Wg1eHsKEtK/mRgB++YshluVa4MlPlq4I6OekdGcg7BSa2Ee73ycBmy9/t9NhTu2
Biy9pfZJYKzsVcwjjCgCzvvRNTN8/Ik5YwRyjJn6NDN7zcJvxTpMJ1Yb5DoIAm+5
WymgK45+QZBSmyH6QKEvGF5WmRtpPvWXHQGsd9sCgYB1U5Zgb2xf9PLs5eBI3lNc
1jKzXhsFBdMgCDM+/eQmoe2m/p+tV9tE1xIvtdm6CEhvjorgryx0dp8eldQo5Urb
NRS5V1Pds7SIg7n5A+Lqx3DQSW7WBg+/HxIfowqBmVVeOw54A1KAi93r7tzHRCqm
Gyfsg2sB9Y0VQspb36o9hg==
-----END PRIVATE KEY-----`;

TestRegister.addTests([
    {
        name: "RSA Decrypt: binary OAEP-SHA256 input and output",
        input: "bf130206572b4091a8b29295896d84de3d445c071cdf5646b662fb76cbe9ab905fc23cca1612926d4d05fafde3bb11f5760af0bac45ce880d3fb9b56ab3f159f31049723a5b03d0262630f2f4d984aa789d1b3c9839ead4c04eefe1adec9688f61bc5c9e9a9a25c65273169e0262910a94eeca1a0cdfceca0bdb358a42ae118df0b86903566360c23fe7ea0062b8bec56e15881747ab8286b12e12ef77d5e4dbfc5f3579b8cc4235065425da51cbb02f90d4701133aa489850e4281d45c33d30ddbf492f8ab74c0532174431d39e95e1d0be77142e6863528de82d960d81e61051b2e428e30b106d7aeed1ce77c9e99072094de5d56332fcf586a36a2c31db10",
        expectedOutput: "f89766d163f006af7d37beeee64ae9e2b071abb64fe2e2fb36e8e49ee7b5b061",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "RSA Decrypt",
                "args": [PEM_PRIV_OAEP_SHA256, "", "RSA-OAEP", "SHA-256"]
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
