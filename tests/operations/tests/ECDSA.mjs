/**
 * ECDSA tests.
 *
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import { ASCII_TEXT } from "../../samples/Ciphers.mjs";

const P256 = {
    // openssl ecparam -name prime256v1 -genkey -noout -out p256.priv.key
    privateKeyPkcs1: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINtTjwUkgfAiSwqgcGAXWyE0ueIW6n2k395dmQZ3vGr4oAoGCCqGSM49
AwEHoUQDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJgusgcAE8H6810fkJ8ZmTNiCC
a6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END EC PRIVATE KEY-----`,
    privateKeyPkcs8: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg21OPBSSB8CJLCqBw
YBdbITS54hbqfaTf3l2ZBne8avihRANCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC
6yBwATwfrzXR+QnxmZM2IIJrqwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7p
-----END PRIVATE KEY-----`,

    // openssl ec -in p256.priv.key -pubout -out p256.pub.key
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJ
gusgcAE8H6810fkJ8ZmTNiCCa6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END PUBLIC KEY-----`,

    signature: {
        sha256: {
            asn1: "3046022100e06905608a2fa7dbda9e284c2a7959dfb68fb527a5f003b2d7975ff135145127022100b6baa253793334f8b93ea1dd622bc600124d8090babd807efe3f77b8b324388d",
            p1363: "e06905608a2fa7dbda9e284c2a7959dfb68fb527a5f003b2d7975ff135145127b6baa253793334f8b93ea1dd622bc600124d8090babd807efe3f77b8b324388d",
            json: `{"r":"00e06905608a2fa7dbda9e284c2a7959dfb68fb527a5f003b2d7975ff135145127","s":"00b6baa253793334f8b93ea1dd622bc600124d8090babd807efe3f77b8b324388d"}`
        }
    }
};

// openssl pkcs8 -topk8 -in p256.priv.key -out p256.enc-priv.key -v2 des3 -v2prf hmacWithSHA1 -passout pass:Test1234
/* const PEM_PRIV_P256_ENCRYPTED_PASS = "Test1234";
const PEM_PRIV_P256_ENCRYPTED = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIHsMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAg+4ckqI9Q9ZAICCAAw
DAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEEOnMUW15Hn/ub0OcCCj9lksEgZCk
kxaK4d430lZHovcA4ZeKTt94QcfjnIHRk65aZt93l17l52pv6n/srs3aRo/n5RV+
wZ5sTLF0925ZQWJB5cIhzc8KQIvguGCX1znLQJJaRHyYOUXIN77AKEfALKAinBit
25paDnbXAqGn1CR3UwFWUZZW+c3UEhWhmpghQpS1tIl0KI6IAvnrGIdw2kKIouo=
-----END ENCRYPTED PRIVATE KEY-----`;*/

const P384 = {
    privateKeyPkcs8: `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDAYo22xn2kZjN8MInom
NDsgD/zhpUwnCYch634jUgO59fN9m2lR5ekaI1XABHz39rihZANiAAQwXoCsPOLv
Nn2STUs/hpL41CQveSL3WUmJ4QdtD7UFCl1mBO6ME0xSUgIQTUNkHt5k9CpOq3x9
r+LG5+GcisoLn7R54R+bRoGp/p1ZBeuBXoCgthvs+RFoT3OewUmA8oQ=
-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEMF6ArDzi7zZ9kk1LP4aS+NQkL3ki91lJ
ieEHbQ+1BQpdZgTujBNMUlICEE1DZB7eZPQqTqt8fa/ixufhnIrKC5+0eeEfm0aB
qf6dWQXrgV6AoLYb7PkRaE9znsFJgPKE
-----END PUBLIC KEY-----`
};

const P521 = {
    privateKeyPkcs8: `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAifBaJDqNwOtKgThc
FU34GzPQ73ubOQg9dnighpVGwA3b/KwCifimCNKDmKnXJaE04mEcxg8yzcFKausF
5I8o206hgYkDgYYABAGwpkwrBBlZOdx4u9mxqYxJvtzAHaFFAzl21WQVbAjyrqXe
nFPMkhbFpEEWr1ualPYKQkHe14AX33iU3fQ9MlBkgAAripsPbiKggAaog74cUERo
qbrUFZwMbptGgovpE6pU93h7A1wb3Vtw9DZQCgiNbwzMbdsft+p2RJ8iSxWEC6Gd
mw==
-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBsKZMKwQZWTnceLvZsamMSb7cwB2h
RQM5dtVkFWwI8q6l3pxTzJIWxaRBFq9bmpT2CkJB3teAF994lN30PTJQZIAAK4qb
D24ioIAGqIO+HFBEaKm61BWcDG6bRoKL6ROqVPd4ewNcG91bcPQ2UAoIjW8MzG3b
H7fqdkSfIksVhAuhnZs=
-----END PUBLIC KEY-----`
};

const PEM_PPRIV_RSA512 = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelMYKtboGLrk6ihtqFPZFRL
NcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQJAOJUpM0lv36MAQR3WAwsF
F7DOy+LnigteCvaNWiNVxZ6jByB5Qb7sall/Qlu9sFI0ZwrlVcKS0kldee7JTYlL
WQIhAP3UKEfOtpTgT1tYmdhaqjxqMfxBom0Ri+rt9ajlzs6vAiEA9L85B8/Gnb7p
6Af7/wpmafL277OV4X4xBfzMR+TUzHUCIBq+VLQkInaTH6lXL3ZtLwyIf9W9MJjf
RWeuRLjT5bM/AiBF7Kw6kx5Hy1fAtydEApCoDIaIjWJw/kC7WTJ0B+jUUQIgV6dw
NSyj0feakeD890gmId+lvl/w/3oUXiczqvl/N9o=
-----END RSA PRIVATE KEY-----`;
const PEM_PUB_RSA512 = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelM
YKtboGLrk6ihtqFPZFRLNcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQ==
-----END PUBLIC KEY-----`;

TestRegister.addTests([
    {
        name: "ECDSA Sign/Verify: P-256 with MD5",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs1, "MD5", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "MD5", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-256 with SHA1",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs1, "SHA-1", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-1", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-256 with SHA256",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs1, "SHA-256", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-256", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-256 with SHA384",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs1, "SHA-384", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-384", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-256 with SHA512",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs1, "SHA-512", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-512", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify:: Using a private key in PKCS#8 format works",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.privateKeyPkcs8, "SHA-256", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-256", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-384 with SHA384",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P384.privateKeyPkcs8, "SHA-384", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-384", P384.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Sign/Verify: P-521 with SHA512",
        input: ASCII_TEXT,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P521.privateKeyPkcs8, "SHA-512", "ASN.1 HEX"]
            },
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-512", P521.publicKey, ASCII_TEXT]
            }
        ]
    },

    // ECDSA Sign
    {
        name: "ECDSA Sign: Using public key fails",
        input: ASCII_TEXT,
        expectedOutput: "Provided key is not a private key.",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [P256.publicKey, "SHA-256", "ASN.1 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Sign: Using an RSA key fails",
        input: ASCII_TEXT,
        expectedOutput: "Provided key is not an EC key.",
        recipeConfig: [
            {
                "op": "ECDSA Sign",
                "args": [PEM_PPRIV_RSA512, "SHA-256", "ASN.1 HEX"]
            }
        ]
    },

    // ECDSA Verify
    {
        name: "ECDSA Verify: P-256 with SHA256 (ASN.1 signature)",
        input: P256.signature.sha256.asn1,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Verify",
                "args": ["Auto", "SHA-256", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Verify: P-256 with SHA256 (P1363 signature)",
        input: P256.signature.sha256.p1363,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Verify",
                "args": ["Auto", "SHA-256", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Verify: P-256 with SHA256 (JSON signature)",
        input: P256.signature.sha256.json,
        expectedOutput: "Verified OK",
        recipeConfig: [
            {
                "op": "ECDSA Verify",
                "args": ["Auto", "SHA-256", P256.publicKey, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Verify: Using private key fails",
        input: P256.signature.sha256.asn1,
        expectedOutput: "Provided key is not a public key.",
        recipeConfig: [
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-256", P256.privateKeyPkcs1, ASCII_TEXT]
            }
        ]
    },
    {
        name: "ECDSA Verify: Using an RSA key fails",
        input: P256.signature.sha256.asn1,
        expectedOutput: "Provided key is not an EC key.",
        recipeConfig: [
            {
                "op": "ECDSA Verify",
                "args": ["ASN.1 HEX", "SHA-256", PEM_PUB_RSA512, ASCII_TEXT]
            }
        ]
    },

    // ECDSA Signatur Conversion
    {
        name: "ECDSA Signature Conversion: ASN.1 To ASN.1",
        input: P256.signature.sha256.asn1,
        expectedOutput: P256.signature.sha256.asn1,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "ASN.1 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: ASN.1 To P1363",
        input: P256.signature.sha256.asn1,
        expectedOutput: P256.signature.sha256.p1363,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "P1363 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: ASN.1 To JSON",
        input: P256.signature.sha256.asn1,
        expectedOutput: P256.signature.sha256.json,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "JSON"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: P1363 To ASN.1",
        input: P256.signature.sha256.p1363,
        expectedOutput: P256.signature.sha256.asn1,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "ASN.1 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: P1363 To P1363",
        input: P256.signature.sha256.p1363,
        expectedOutput: P256.signature.sha256.p1363,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "P1363 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: P1363 To JSON",
        input: P256.signature.sha256.p1363,
        expectedOutput: P256.signature.sha256.json,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "JSON"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: JSON To ASN.1",
        input: P256.signature.sha256.json,
        expectedOutput: P256.signature.sha256.asn1,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "ASN.1 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: JSON To P1363",
        input: P256.signature.sha256.json,
        expectedOutput: P256.signature.sha256.p1363,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "P1363 HEX"]
            }
        ]
    },
    {
        name: "ECDSA Signature Conversion: JSON To JSON",
        input: P256.signature.sha256.json,
        expectedOutput: P256.signature.sha256.json,
        recipeConfig: [
            {
                "op": "ECDSA Signature Conversion",
                "args": ["Auto", "JSON"]
            }
        ]
    }
]);
