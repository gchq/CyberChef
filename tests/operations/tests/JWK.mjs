/**
 * JWK conversion
 *
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// test data for RSA key pair
const RSA_512 = {
    private: {
        pem1: `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelMYKtboGLrk6ihtqFPZFRL
NcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQJAOJUpM0lv36MAQR3WAwsF
F7DOy+LnigteCvaNWiNVxZ6jByB5Qb7sall/Qlu9sFI0ZwrlVcKS0kldee7JTYlL
WQIhAP3UKEfOtpTgT1tYmdhaqjxqMfxBom0Ri+rt9ajlzs6vAiEA9L85B8/Gnb7p
6Af7/wpmafL277OV4X4xBfzMR+TUzHUCIBq+VLQkInaTH6lXL3ZtLwyIf9W9MJjf
RWeuRLjT5bM/AiBF7Kw6kx5Hy1fAtydEApCoDIaIjWJw/kC7WTJ0B+jUUQIgV6dw
NSyj0feakeD890gmId+lvl/w/3oUXiczqvl/N9o=
-----END RSA PRIVATE KEY-----`,
        pem8: `-----BEGIN PRIVATE KEY-----
MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA8qvQOnph0i3M5+Tp
ruZrsvgEXgud6Uxgq1ugYuuTqKG2oU9kVEs1wmLrwe+e3yy0ys/nS3qOrBZDYSMx
2SPp+wIDAQABAkA4lSkzSW/fowBBHdYDCwUXsM7L4ueKC14K9o1aI1XFnqMHIHlB
vuxqWX9CW72wUjRnCuVVwpLSSV157slNiUtZAiEA/dQoR862lOBPW1iZ2FqqPGox
/EGibRGL6u31qOXOzq8CIQD0vzkHz8advunoB/v/CmZp8vbvs5XhfjEF/MxH5NTM
dQIgGr5UtCQidpMfqVcvdm0vDIh/1b0wmN9FZ65EuNPlsz8CIEXsrDqTHkfLV8C3
J0QCkKgMhoiNYnD+QLtZMnQH6NRRAiBXp3A1LKPR95qR4Pz3SCYh36W+X/D/ehRe
JzOq+X832g==
-----END PRIVATE KEY-----`,
        jwk: {
            "kty": "RSA",
            "n": "8qvQOnph0i3M5-TpruZrsvgEXgud6Uxgq1ugYuuTqKG2oU9kVEs1wmLrwe-e3yy0ys_nS3qOrBZDYSMx2SPp-w",
            "e": "AQAB",
            "d": "OJUpM0lv36MAQR3WAwsFF7DOy-LnigteCvaNWiNVxZ6jByB5Qb7sall_Qlu9sFI0ZwrlVcKS0kldee7JTYlLWQ",
            "p": "_dQoR862lOBPW1iZ2FqqPGox_EGibRGL6u31qOXOzq8",
            "q": "9L85B8_Gnb7p6Af7_wpmafL277OV4X4xBfzMR-TUzHU",
            "dp": "Gr5UtCQidpMfqVcvdm0vDIh_1b0wmN9FZ65EuNPlsz8",
            "dq": "ReysOpMeR8tXwLcnRAKQqAyGiI1icP5Au1kydAfo1FE",
            "qi": "V6dwNSyj0feakeD890gmId-lvl_w_3oUXiczqvl_N9o"
        }
    },
    public: {
        pem1: `-----BEGIN RSA PUBLIC KEY-----
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAE=
-----END RSA PUBLIC KEY-----`,
        pem8: `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelM
YKtboGLrk6ihtqFPZFRLNcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQ==
-----END PUBLIC KEY-----`,
        cert: `-----BEGIN CERTIFICATE-----
MIIBfTCCASegAwIBAgIUeisK5Nwss2DGg5PCs4uSxxXyyNkwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIUlNBIHRlc3QwHhcNMjExMTE5MTcyMDI2WhcNMzExMTE3
MTcyMDI2WjATMREwDwYDVQQDDAhSU0EgdGVzdDBcMA0GCSqGSIb3DQEBAQUAA0sA
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAGjUzBRMB0GA1UdDgQWBBRO+jvkqq5p
pnQgwMMnRoun6e7eiTAfBgNVHSMEGDAWgBRO+jvkqq5ppnQgwMMnRoun6e7eiTAP
BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA0EAR/5HAZM5qBhU/ezDUIFx
gmUGoFbIb5kJD41YCnaSdrgWglh4He4melSs42G/oxBBjuCJ0bUpqWnLl+lJkv1z
IA==
-----END CERTIFICATE-----`,
        jwk: {
            "kty": "RSA",
            "n": "8qvQOnph0i3M5-TpruZrsvgEXgud6Uxgq1ugYuuTqKG2oU9kVEs1wmLrwe-e3yy0ys_nS3qOrBZDYSMx2SPp-w",
            "e": "AQAB"
        }
    }
};

// test data for EC key pair
const EC_P256 = {
    private: {
        pem1: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINtTjwUkgfAiSwqgcGAXWyE0ueIW6n2k395dmQZ3vGr4oAoGCCqGSM49
AwEHoUQDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJgusgcAE8H6810fkJ8ZmTNiCC
a6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END EC PRIVATE KEY-----`,
        pem8: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg21OPBSSB8CJLCqBw
YBdbITS54hbqfaTf3l2ZBne8avihRANCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC
6yBwATwfrzXR+QnxmZM2IIJrqwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7p
-----END PRIVATE KEY-----`,
        jwk: {
            "kty": "EC",
            "crv": "P-256",
            "x": "DUc8A0EDNKoCYIPWMHz1yUzqE5mJgusgcAE8H6810fk",
            "y": "CfGZkzYggmurC4Edrw9VTYdnYoq1oCjx-D1TCmr-Xuk",
            "d": "21OPBSSB8CJLCqBwYBdbITS54hbqfaTf3l2ZBne8avg"
        }
    },
    public: {
        pem8: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJ
gusgcAE8H6810fkJ8ZmTNiCCa6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END PUBLIC KEY-----`,
        cert: `-----BEGIN CERTIFICATE-----
MIIBfzCCASWgAwIBAgIUK4H8J3Hr7NpRLPrACj8Pje4JJJ0wCgYIKoZIzj0EAwIw
FTETMBEGA1UEAwwKUC0yNTYgdGVzdDAeFw0yMTExMTkxNzE5NDVaFw0zMTExMTcx
NzE5NDVaMBUxEzARBgNVBAMMClAtMjU2IHRlc3QwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC6yBwATwfrzXR+QnxmZM2IIJr
qwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7po1MwUTAdBgNVHQ4EFgQU/SxodXrpkybM
gcIgkxnRKd7HMzowHwYDVR0jBBgwFoAU/SxodXrpkybMgcIgkxnRKd7HMzowDwYD
VR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiBU9PrOa/kXCpTTBInRf/sN
ac2iDHmbdpWzcXI+xLKNYAIhAIRR1LRSHVwOTLQ/iBXd+8LCkm5aTB27RW46LN80
ylxt
-----END CERTIFICATE-----`,
        jwk: {
            "kty": "EC",
            "crv": "P-256",
            "x": "DUc8A0EDNKoCYIPWMHz1yUzqE5mJgusgcAE8H6810fk",
            "y": "CfGZkzYggmurC4Edrw9VTYdnYoq1oCjx-D1TCmr-Xuk"
        }
    }
};

const PEM_PRIV_DSA1024 = `-----BEGIN DSA PRIVATE KEY-----
MIIBuwIBAAKBgQCkFEttBrPHEJRgcvaT8HbZs9h1pVQLHhn2F452izusRox1czMM
IC8Z7YQiM1pt6bgEmf0h8ldx6UFT0YL9JWSbyBy1U5pHKfnz/xjeg7ZMReL4F0/T
Gwmu4ercqfM//TmEg9nL3nDxb4WmF2al/SmHN3qlzYmYaIDEFfEuu8vWbwIVAMOq
7pqQiMGUu6uJY/nQTWW0c3IfAoGARWryStp2AElj538qN9tWRuyobRA93Q1ujrdM
EqsqVpMZd1a8qtRyMaZVVdB7N3EweNUuFOoSAp10s/SQEH9qhVo6NwvzhB7lEtm4
5FjWW9+9WCuuFOGZpTy8PSFAvQcfUqunP/DeaDliNmgKci+n0nfIBakuQn10Zmqk
vGu8NZICgYBUsoQeXSJ19e6XZenk6G8wVI3yXFqnRAwb6s7sAVoPwfDCsOXTxC7W
Mlfz0HcYMiifFKEd28NnuAZ2e0ngyPHsb9s5phzTgRfO3GFzOjsjwgx3DmQI2Ck2
yOWHSAtaNhH4DoBZEyNsb1akiB50vx9b09EHN4weqbgAu743NMDHRQIVAIG5uiiO
OnWUYieHAiVIPkBCrYUd
-----END DSA PRIVATE KEY-----`;

// https://datatracker.ietf.org/doc/html/rfc8037#appendix-A.2
const JWK_PUB_ED25591 = {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
};

TestRegister.addTests([
    {
        name: "PEM to JWK: Missing footer",
        input: RSA_512.private.pem1.substring(0, RSA_512.private.pem1.length / 2),
        expectedOutput: "PEM footer '-----END RSA PRIVATE KEY-----' not found",
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: DSA not supported",
        input: PEM_PRIV_DSA1024,
        expectedOutput: "DSA keys are not supported for JWK",
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },

    // test RSA key convertion
    {
        name: "PEM to JWK: RSA Private Key PKCS1",
        input: RSA_512.private.pem1,
        expectedOutput: JSON.stringify(RSA_512.private.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: RSA Private Key PKCS8",
        input: RSA_512.private.pem8,
        expectedOutput: JSON.stringify(RSA_512.private.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: RSA Public Key PKCS1",
        input: RSA_512.public.pem1,
        expectedOutput: "Unsupported RSA public key format. Only PKCS#8 is supported.",
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: RSA Public Key PKCS8",
        input: RSA_512.public.pem8,
        expectedOutput: JSON.stringify(RSA_512.public.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: Certificate with RSA Public Key",
        input: RSA_512.public.cert,
        expectedOutput: JSON.stringify(RSA_512.public.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },

    // test EC key conversion
    {
        name: "PEM to JWK: EC Private Key PKCS1",
        input: EC_P256.private.pem1,
        expectedOutput: JSON.stringify(EC_P256.private.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: EC Private Key PKCS8",
        input: EC_P256.private.pem8,
        expectedOutput: JSON.stringify(EC_P256.private.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: EC Public Key",
        input: EC_P256.public.pem8,
        expectedOutput: JSON.stringify(EC_P256.public.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },
    {
        name: "PEM to JWK: Certificate with EC Public Key",
        input: EC_P256.public.cert,
        expectedOutput: JSON.stringify(EC_P256.public.jwk),
        recipeConfig: [
            {
                op: "PEM to JWK",
                args: [],
            }
        ],
    },


    {
        name: "JWK to PEM: not a JWK",
        input: "\"foobar\"",
        expectedOutput: "Input is not a JSON Web Key",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },
    {
        name: "JWK to PEM: unsupported key type",
        input: JSON.stringify(JWK_PUB_ED25591),
        expectedOutput: "Unsupported JWK key type 'OKP'",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },

    // test RSA key conversion
    {
        name: "JWK to PEM: RSA Private Key",
        input: JSON.stringify(RSA_512.private.jwk),
        expectedOutput: RSA_512.private.pem8.replace(/\r/g, "").replace(/\n/g, "\r\n")+"\r\n",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },
    {
        name: "JWK to PEM: RSA Public Key",
        input: JSON.stringify(RSA_512.public.jwk),
        expectedOutput: RSA_512.public.pem8.replace(/\r/g, "").replace(/\n/g, "\r\n")+"\r\n",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },

    // test EC key conversion
    {
        name: "JWK to PEM: EC Private Key",
        input: JSON.stringify(EC_P256.private.jwk),
        expectedOutput: EC_P256.private.pem8.replace(/\r/g, "").replace(/\n/g, "\r\n")+"\r\n",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },
    {
        name: "JWK to PEM: EC Public Key",
        input: JSON.stringify(EC_P256.public.jwk),
        expectedOutput: EC_P256.public.pem8.replace(/\r/g, "").replace(/\n/g, "\r\n")+"\r\n",
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },

    {
        name: "JWK to PEM: Array of keys",
        input: JSON.stringify([RSA_512.public.jwk, EC_P256.public.jwk]),
        expectedOutput: (RSA_512.public.pem8 + "\n" + EC_P256.public.pem8 + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    },
    {
        name: "JWK to PEM: JSON Web Key Set",
        input: JSON.stringify({"keys": [RSA_512.public.jwk, EC_P256.public.jwk]}),
        expectedOutput: (RSA_512.public.pem8 + "\n" + EC_P256.public.pem8 + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "JWK to PEM",
                args: [],
            }
        ],
    }
]);
