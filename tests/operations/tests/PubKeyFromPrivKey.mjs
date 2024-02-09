/**
 * Public Key from Private Key
 *
 * @author cplussharp
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const RSA_PRIVKEY_PKCS1 = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelMYKtboGLrk6ihtqFPZFRL
NcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQJAOJUpM0lv36MAQR3WAwsF
F7DOy+LnigteCvaNWiNVxZ6jByB5Qb7sall/Qlu9sFI0ZwrlVcKS0kldee7JTYlL
WQIhAP3UKEfOtpTgT1tYmdhaqjxqMfxBom0Ri+rt9ajlzs6vAiEA9L85B8/Gnb7p
6Af7/wpmafL277OV4X4xBfzMR+TUzHUCIBq+VLQkInaTH6lXL3ZtLwyIf9W9MJjf
RWeuRLjT5bM/AiBF7Kw6kx5Hy1fAtydEApCoDIaIjWJw/kC7WTJ0B+jUUQIgV6dw
NSyj0feakeD890gmId+lvl/w/3oUXiczqvl/N9o=
-----END RSA PRIVATE KEY-----`;

const RSA_PRIVKEY_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA8qvQOnph0i3M5+Tp
ruZrsvgEXgud6Uxgq1ugYuuTqKG2oU9kVEs1wmLrwe+e3yy0ys/nS3qOrBZDYSMx
2SPp+wIDAQABAkA4lSkzSW/fowBBHdYDCwUXsM7L4ueKC14K9o1aI1XFnqMHIHlB
vuxqWX9CW72wUjRnCuVVwpLSSV157slNiUtZAiEA/dQoR862lOBPW1iZ2FqqPGox
/EGibRGL6u31qOXOzq8CIQD0vzkHz8advunoB/v/CmZp8vbvs5XhfjEF/MxH5NTM
dQIgGr5UtCQidpMfqVcvdm0vDIh/1b0wmN9FZ65EuNPlsz8CIEXsrDqTHkfLV8C3
J0QCkKgMhoiNYnD+QLtZMnQH6NRRAiBXp3A1LKPR95qR4Pz3SCYh36W+X/D/ehRe
JzOq+X832g==
-----END PRIVATE KEY-----`;

const RSA_PUBKEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelM
YKtboGLrk6ihtqFPZFRLNcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQ==
-----END PUBLIC KEY-----`;

const EC_P256_PRIVKEY_SEC1 = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINtTjwUkgfAiSwqgcGAXWyE0ueIW6n2k395dmQZ3vGr4oAoGCCqGSM49
AwEHoUQDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJgusgcAE8H6810fkJ8ZmTNiCC
a6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END EC PRIVATE KEY-----`;

const EC_P256_PRIVKEY_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg21OPBSSB8CJLCqBw
YBdbITS54hbqfaTf3l2ZBne8avihRANCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC
6yBwATwfrzXR+QnxmZM2IIJrqwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7p
-----END PRIVATE KEY-----`;

const EC_P256_PUBKEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJ
gusgcAE8H6810fkJ8ZmTNiCCa6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END PUBLIC KEY-----`;

const DSA_PRIVKEY_TRAD = `-----BEGIN DSA PRIVATE KEY-----
MIIDTQIBAAKCAQEAugtX67Pu8xhkIi7Bc2SBlrC8OBkAbVPsiIbTfRaCp6xE2dy6
hRA6YAkKK43OSNU1JjTytpt7H9EiRYgu/E/3VKXOED23352nzunbfx5zEZrWwPat
77LflE/sjE1Pffrfc23AYi1ncGqoCGgya7DDDFq7QTzPBih1NOXBNGnhBU+kwfV4
kJQF4TNxY/llnWVE2FHkzZOrNJTfJrn/hzdr2sjzqH1UhWDDzJW/DfLrJyXOMAub
ae0PmuKyR0xnqYyR9hDARsgZFMQtfoDstnSVfUKKyV6cX0BJvYTiDacZwxDS5IbM
Dhb2Z/rDCY9LqLBfn5C7+LqMKbmLft9DUfkcdQIdAMD5Sc8czo9kSB8V6fx2NmmX
9yXTkylaT52eKQUCggEANc5OkHDRYD5SKHEMb7qqozTmTFUxibPohFn/Tp99lIZU
U3oHHWLSze+TMzlXwawqmQqRKTtXx9NCcAgiUya3Vjt9/6eDv5N9ii0yu+8RiWiV
grTonZZahQDyIqnz6fny92iTL7Fma4aZy8ICiNUNsR5TbASpgTU/OscJI6g6IoHY
/h86HK4X6rETyeTNREiDZGZJKSpY6ReJbIrJ+lRoH7hwSKynhOEQ0Q+Z2e0TW8uH
avsQ4jGkTkPQ0DLbAUqp7eWN+ATpew9kqBUCC5ENWnN2YvpYNjsMz8FxLvbq/H6R
fnlAOSzO95yto2KueKvZCsH9rQlCMXpjrbIaYbsYXwKCAQBpN+w0N0b5IIAspXnl
J9yuB6ORk3j/5rZ+DUtTzW1YAJI6xjTcFQvN7FpVLkmLtXKUXF04R+sdGJ7VFwOb
0rbaL5vQzrqNkBrbgSzuzeloiG+7OLA6VeQtNbQh6OurrZFi9gY+qA5ciT9kQXyr
HudVXu956NDrooRxmv6JIVFvToaNiwe2vcgdkALw8HUbLFYof4SAE9jgU8EpxTp0
2e8HzvVSVa6yj1nnGhpzLPlEqF8TZvs9pTg2kIk3/zvWojMJoPyTALfbTjbAeiFM
MeKNK/CKOOJj23AVAZxpMSR6cUbrIcRdKDnhCTVkkxXUecAIUs6Mk10kSfkuiGl9
LjKjAhwpK4MOpkKEu+y308fZ+yZXypZW2m9Y/wOT0L4g
-----END DSA PRIVATE KEY-----`;

const DSA_PRIVKEY_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIICXAIBADCCAjUGByqGSM44BAEwggIoAoIBAQC6C1frs+7zGGQiLsFzZIGWsLw4
GQBtU+yIhtN9FoKnrETZ3LqFEDpgCQorjc5I1TUmNPK2m3sf0SJFiC78T/dUpc4Q
PbffnafO6dt/HnMRmtbA9q3vst+UT+yMTU99+t9zbcBiLWdwaqgIaDJrsMMMWrtB
PM8GKHU05cE0aeEFT6TB9XiQlAXhM3Fj+WWdZUTYUeTNk6s0lN8muf+HN2vayPOo
fVSFYMPMlb8N8usnJc4wC5tp7Q+a4rJHTGepjJH2EMBGyBkUxC1+gOy2dJV9QorJ
XpxfQEm9hOINpxnDENLkhswOFvZn+sMJj0uosF+fkLv4uowpuYt+30NR+Rx1Ah0A
wPlJzxzOj2RIHxXp/HY2aZf3JdOTKVpPnZ4pBQKCAQA1zk6QcNFgPlIocQxvuqqj
NOZMVTGJs+iEWf9On32UhlRTegcdYtLN75MzOVfBrCqZCpEpO1fH00JwCCJTJrdW
O33/p4O/k32KLTK77xGJaJWCtOidllqFAPIiqfPp+fL3aJMvsWZrhpnLwgKI1Q2x
HlNsBKmBNT86xwkjqDoigdj+HzocrhfqsRPJ5M1ESINkZkkpKljpF4lsisn6VGgf
uHBIrKeE4RDRD5nZ7RNby4dq+xDiMaROQ9DQMtsBSqnt5Y34BOl7D2SoFQILkQ1a
c3Zi+lg2OwzPwXEu9ur8fpF+eUA5LM73nK2jYq54q9kKwf2tCUIxemOtshphuxhf
BB4CHCkrgw6mQoS77LfTx9n7JlfKllbab1j/A5PQviA=
-----END PRIVATE KEY-----`;

const DSA_PUBKEY = `-----BEGIN PUBLIC KEY-----
MIIDQjCCAjUGByqGSM44BAEwggIoAoIBAQC6C1frs+7zGGQiLsFzZIGWsLw4GQBt
U+yIhtN9FoKnrETZ3LqFEDpgCQorjc5I1TUmNPK2m3sf0SJFiC78T/dUpc4QPbff
nafO6dt/HnMRmtbA9q3vst+UT+yMTU99+t9zbcBiLWdwaqgIaDJrsMMMWrtBPM8G
KHU05cE0aeEFT6TB9XiQlAXhM3Fj+WWdZUTYUeTNk6s0lN8muf+HN2vayPOofVSF
YMPMlb8N8usnJc4wC5tp7Q+a4rJHTGepjJH2EMBGyBkUxC1+gOy2dJV9QorJXpxf
QEm9hOINpxnDENLkhswOFvZn+sMJj0uosF+fkLv4uowpuYt+30NR+Rx1Ah0AwPlJ
zxzOj2RIHxXp/HY2aZf3JdOTKVpPnZ4pBQKCAQA1zk6QcNFgPlIocQxvuqqjNOZM
VTGJs+iEWf9On32UhlRTegcdYtLN75MzOVfBrCqZCpEpO1fH00JwCCJTJrdWO33/
p4O/k32KLTK77xGJaJWCtOidllqFAPIiqfPp+fL3aJMvsWZrhpnLwgKI1Q2xHlNs
BKmBNT86xwkjqDoigdj+HzocrhfqsRPJ5M1ESINkZkkpKljpF4lsisn6VGgfuHBI
rKeE4RDRD5nZ7RNby4dq+xDiMaROQ9DQMtsBSqnt5Y34BOl7D2SoFQILkQ1ac3Zi
+lg2OwzPwXEu9ur8fpF+eUA5LM73nK2jYq54q9kKwf2tCUIxemOtshphuxhfA4IB
BQACggEAaTfsNDdG+SCALKV55SfcrgejkZN4/+a2fg1LU81tWACSOsY03BULzexa
VS5Ji7VylFxdOEfrHRie1RcDm9K22i+b0M66jZAa24Es7s3paIhvuziwOlXkLTW0
Iejrq62RYvYGPqgOXIk/ZEF8qx7nVV7veejQ66KEcZr+iSFRb06GjYsHtr3IHZAC
8PB1GyxWKH+EgBPY4FPBKcU6dNnvB871UlWuso9Z5xoacyz5RKhfE2b7PaU4NpCJ
N/871qIzCaD8kwC32042wHohTDHijSvwijjiY9twFQGcaTEkenFG6yHEXSg54Qk1
ZJMV1HnACFLOjJNdJEn5LohpfS4yow==
-----END PUBLIC KEY-----`;

const ED25519_PRIVKEY = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIC18vtoHINC8Mo9dTIqOrBs3J28ZvHrwzRq57g2kpV98
-----END PRIVATE KEY-----`;

/*
const ED25519_PUBKEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAELP6AflXwsuZ5q4NDIO0LP2iCdKRvds4nwsUmRhOw3g=
-----END PUBLIC KEY-----`;
*/

const ED448_PRIVKEY = `-----BEGIN PRIVATE KEY-----
MEcCAQAwBQYDK2VxBDsEOWdGJ06bDcWznJhBoQqPeTfsCe+AvBv1n7KfIGYzR4tv
1kcwHnbxlemnCMgqvbrRXaLuFUBysUZThA==
-----END PRIVATE KEY-----`;

/*
const ED448_PUBKEY = `-----BEGIN PUBLIC KEY-----
MEMwBQYDK2VxAzoAVN8kG0TMVyGOu/OvBTe8H0Wi4HJrQAlSv4XLwJbkuoi4EeRl
EHQwXsNYLZTtY2Jra6AWhbVYYaEA
-----END PUBLIC KEY-----`;
*/

TestRegister.addTests([
    {
        name: "Public Key from Private Key: Missing footer",
        input: RSA_PRIVKEY_PKCS1.substring(0, RSA_PRIVKEY_PKCS1.length / 2),
        expectedOutput: "PEM footer '-----END RSA PRIVATE KEY-----' not found",
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },

    // test RSA
    {
        name: "Public Key from Private Key: RSA PKCS#1",
        input: RSA_PRIVKEY_PKCS1,
        expectedOutput: (RSA_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from Private Key: RSA PKCS#8",
        input: RSA_PRIVKEY_PKCS8,
        expectedOutput: (RSA_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },

    // test EC certificate
    {
        name: "Public Key from Private Key: EC SEC1",
        input: EC_P256_PRIVKEY_SEC1,
        expectedOutput: (EC_P256_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from Private Key: EC PKCS#8",
        input: EC_P256_PRIVKEY_PKCS8,
        expectedOutput: (EC_P256_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },

    // test DSA
    {
        name: "Public Key from Private Key: DSA Traditional",
        input: DSA_PRIVKEY_TRAD,
        expectedOutput: (DSA_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from Private Key: DSA PKCS#8",
        input: DSA_PRIVKEY_PKCS8,
        expectedOutput: "DSA Private Key in PKCS#8 is not supported",
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },

    // test EdDSA
    {
        name: "Public Key from Private Key: Ed25519",
        input: ED25519_PRIVKEY,
        expectedOutput: "Unsupported key type: Error: malformed PKCS8 private key(code:004)",
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from Private Key: Ed448",
        input: ED448_PRIVKEY,
        expectedOutput: "Unsupported key type: Error: malformed PKCS8 private key(code:004)",
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    },

    // test multi-input
    {
        name: "Public Key from Private Key: Multiple keys",
        input: RSA_PRIVKEY_PKCS8 + "\n" + EC_P256_PRIVKEY_PKCS8,
        expectedOutput: (RSA_PUBKEY + "\n" + EC_P256_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Private Key",
                args: [],
            }
        ],
    }
]);
