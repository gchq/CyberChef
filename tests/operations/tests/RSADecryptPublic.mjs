/**
 * RSA Decrypt Public Key tests.
 *
 * @author Fra3zz
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const PRIV_512_PKCS1 = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelMYKtboGLrk6ihtqFPZFRL
NcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQJAOJUpM0lv36MAQR3WAwsF
F7DOy+LnigteCvaNWiNVxZ6jByB5Qb7sall/Qlu9sFI0ZwrlVcKS0kldee7JTYlL
WQIhAP3UKEfOtpTgT1tYmdhaqjxqMfxBom0Ri+rt9ajlzs6vAiEA9L85B8/Gnb7p
6Af7/wpmafL277OV4X4xBfzMR+TUzHUCIBq+VLQkInaTH6lXL3ZtLwyIf9W9MJjf
RWeuRLjT5bM/AiBF7Kw6kx5Hy1fAtydEApCoDIaIjWJw/kC7WTJ0B+jUUQIgV6dw
NSyj0feakeD890gmId+lvl/w/3oUXiczqvl/N9o=
-----END RSA PRIVATE KEY-----`;

const PUB_512_SPKI = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelM
YKtboGLrk6ihtqFPZFRLNcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQ==
-----END PUBLIC KEY-----`;

const PUB_512_PKCS1 = `-----BEGIN RSA PUBLIC KEY-----
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAE=
-----END RSA PUBLIC KEY-----`;

TestRegister.addTests([
    {
        name: "RSA Decrypt Public Key: missing key",
        input: "anything",
        expectedOutput: "Please enter a public key.",
        recipeConfig: [
            {
                op: "RSA Decrypt Public Key",
                args: ["", "PKCS1 v1.5"]
            }
        ]
    },
    {
        name: "RSA Decrypt Public Key: PKCS1 v1.5, SPKI public key, round-trip Hello World",
        input: "Hello World",
        expectedOutput: "Hello World",
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS1, "", "PKCS1 v1.5"]
            },
            {
                op: "RSA Decrypt Public Key",
                args: [PUB_512_SPKI, "PKCS1 v1.5"]
            }
        ]
    },
    {
        name: "RSA Decrypt Public Key: PKCS1 v1.5, PKCS#1 RSA public key, round-trip Hello World",
        input: "Hello World",
        expectedOutput: "Hello World",
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS1, "", "PKCS1 v1.5"]
            },
            {
                op: "RSA Decrypt Public Key",
                args: [PUB_512_PKCS1, "PKCS1 v1.5"]
            }
        ]
    },
    {
        name: "RSA Decrypt Public Key: PKCS1 v1.5, SPKI public key, round-trip empty",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS1, "", "PKCS1 v1.5"]
            },
            {
                op: "RSA Decrypt Public Key",
                args: [PUB_512_SPKI, "PKCS1 v1.5"]
            }
        ]
    },
    {
        name: "RSA Decrypt Public Key: PKCS1 v1.5, decrypt from base64 ciphertext",
        input: "2EoJzsG9F9el3Dwxm+7Ua1Ykdpnh9WeS2prrkAYGfnkN9irgRvNIUkOSUJAgy4yQ5RjqAHkKgAdwHvjWqLuLhA==",
        expectedOutput: "Hello World",
        recipeConfig: [
            {
                op: "From Base64",
                args: ["A-Za-z0-9+/=", true, false]
            },
            {
                op: "RSA Decrypt Public Key",
                args: [PUB_512_SPKI, "PKCS1 v1.5"]
            }
        ]
    }
]);
