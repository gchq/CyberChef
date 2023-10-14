/**
 * Public Key from Certificate
 *
 * @author cplussharp
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const RSA_CERT = `-----BEGIN CERTIFICATE-----
MIIBfTCCASegAwIBAgIUeisK5Nwss2DGg5PCs4uSxxXyyNkwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIUlNBIHRlc3QwHhcNMjExMTE5MTcyMDI2WhcNMzExMTE3
MTcyMDI2WjATMREwDwYDVQQDDAhSU0EgdGVzdDBcMA0GCSqGSIb3DQEBAQUAA0sA
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAGjUzBRMB0GA1UdDgQWBBRO+jvkqq5p
pnQgwMMnRoun6e7eiTAfBgNVHSMEGDAWgBRO+jvkqq5ppnQgwMMnRoun6e7eiTAP
BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA0EAR/5HAZM5qBhU/ezDUIFx
gmUGoFbIb5kJD41YCnaSdrgWglh4He4melSs42G/oxBBjuCJ0bUpqWnLl+lJkv1z
IA==
-----END CERTIFICATE-----`;

const RSA_PUBKEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelM
YKtboGLrk6ihtqFPZFRLNcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQ==
-----END PUBLIC KEY-----`;

const EC_P256_CERT = `-----BEGIN CERTIFICATE-----
MIIBfzCCASWgAwIBAgIUK4H8J3Hr7NpRLPrACj8Pje4JJJ0wCgYIKoZIzj0EAwIw
FTETMBEGA1UEAwwKUC0yNTYgdGVzdDAeFw0yMTExMTkxNzE5NDVaFw0zMTExMTcx
NzE5NDVaMBUxEzARBgNVBAMMClAtMjU2IHRlc3QwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC6yBwATwfrzXR+QnxmZM2IIJr
qwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7po1MwUTAdBgNVHQ4EFgQU/SxodXrpkybM
gcIgkxnRKd7HMzowHwYDVR0jBBgwFoAU/SxodXrpkybMgcIgkxnRKd7HMzowDwYD
VR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiBU9PrOa/kXCpTTBInRf/sN
ac2iDHmbdpWzcXI+xLKNYAIhAIRR1LRSHVwOTLQ/iBXd+8LCkm5aTB27RW46LN80
ylxt
-----END CERTIFICATE-----`;

const EC_P256_PUBKEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDUc8A0EDNKoCYIPWMHz1yUzqE5mJ
gusgcAE8H6810fkJ8ZmTNiCCa6sLgR2vD1VNh2diirWgKPH4PVMKav5e6Q==
-----END PUBLIC KEY-----`;

const DSA_CERT = `-----BEGIN CERTIFICATE-----
MIIEXzCCBA2gAwIBAgIUYYcPJB8UQLzUnqkGJvs3J4RI0OgwCwYJYIZIAWUDBAMC
MBMxETAPBgNVBAMMCERTQSBUZXN0MB4XDTIzMTAxNTAwMjEzNVoXDTMzMTAxMjAw
MjEzNVowEzERMA8GA1UEAwwIRFNBIFRlc3QwggNCMIICNQYHKoZIzjgEATCCAigC
ggEBALoLV+uz7vMYZCIuwXNkgZawvDgZAG1T7IiG030WgqesRNncuoUQOmAJCiuN
zkjVNSY08rabex/RIkWILvxP91SlzhA9t9+dp87p238ecxGa1sD2re+y35RP7IxN
T33633NtwGItZ3BqqAhoMmuwwwxau0E8zwYodTTlwTRp4QVPpMH1eJCUBeEzcWP5
ZZ1lRNhR5M2TqzSU3ya5/4c3a9rI86h9VIVgw8yVvw3y6yclzjALm2ntD5riskdM
Z6mMkfYQwEbIGRTELX6A7LZ0lX1CislenF9ASb2E4g2nGcMQ0uSGzA4W9mf6wwmP
S6iwX5+Qu/i6jCm5i37fQ1H5HHUCHQDA+UnPHM6PZEgfFen8djZpl/cl05MpWk+d
nikFAoIBADXOTpBw0WA+UihxDG+6qqM05kxVMYmz6IRZ/06ffZSGVFN6Bx1i0s3v
kzM5V8GsKpkKkSk7V8fTQnAIIlMmt1Y7ff+ng7+TfYotMrvvEYlolYK06J2WWoUA
8iKp8+n58vdoky+xZmuGmcvCAojVDbEeU2wEqYE1PzrHCSOoOiKB2P4fOhyuF+qx
E8nkzURIg2RmSSkqWOkXiWyKyfpUaB+4cEisp4ThENEPmdntE1vLh2r7EOIxpE5D
0NAy2wFKqe3ljfgE6XsPZKgVAguRDVpzdmL6WDY7DM/BcS726vx+kX55QDkszvec
raNirnir2QrB/a0JQjF6Y62yGmG7GF8DggEFAAKCAQBpN+w0N0b5IIAspXnlJ9yu
B6ORk3j/5rZ+DUtTzW1YAJI6xjTcFQvN7FpVLkmLtXKUXF04R+sdGJ7VFwOb0rba
L5vQzrqNkBrbgSzuzeloiG+7OLA6VeQtNbQh6OurrZFi9gY+qA5ciT9kQXyrHudV
Xu956NDrooRxmv6JIVFvToaNiwe2vcgdkALw8HUbLFYof4SAE9jgU8EpxTp02e8H
zvVSVa6yj1nnGhpzLPlEqF8TZvs9pTg2kIk3/zvWojMJoPyTALfbTjbAeiFMMeKN
K/CKOOJj23AVAZxpMSR6cUbrIcRdKDnhCTVkkxXUecAIUs6Mk10kSfkuiGl9LjKj
o1MwUTAdBgNVHQ4EFgQUE+xZdvgiDIFWKQskMYnNaZ3iPHAwHwYDVR0jBBgwFoAU
E+xZdvgiDIFWKQskMYnNaZ3iPHAwDwYDVR0TAQH/BAUwAwEB/zALBglghkgBZQME
AwIDPwAwPAIcZbtf4+bjXEGQqNs6IglLrOgIjYF46q7qCNfXmQIcMKUtH3S6sDJE
3ds9eL+oC+HPFlfUNfUiU30aDA==
-----END CERTIFICATE-----`;

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

const ED25519_CERT = `-----BEGIN CERTIFICATE-----
MIIBQjCB9aADAgECAhRjPJhrdNco5LzpsIs0vSLLaZaZ0DAFBgMrZXAwFzEVMBMG
A1UEAwwMRWQyNTUxOSBUZXN0MB4XDTIzMTAxNTAwMjMwOFoXDTMzMTAxMjAwMjMw
OFowFzEVMBMGA1UEAwwMRWQyNTUxOSBUZXN0MCowBQYDK2VwAyEAELP6AflXwsuZ
5q4NDIO0LP2iCdKRvds4nwsUmRhOw3ijUzBRMB0GA1UdDgQWBBRfxS9q0IemWxkH
4mwAwzr9dQx2xzAfBgNVHSMEGDAWgBRfxS9q0IemWxkH4mwAwzr9dQx2xzAPBgNV
HRMBAf8EBTADAQH/MAUGAytlcANBAI/+03iVq4yJ+DaLVs61w41cVX2UxKvquSzv
lllkpkclM9LH5dLrw4ArdTjS9zAjzY/02WkphHhICHXt3KqZTwI=
-----END CERTIFICATE-----`;

/*
const ED25519_PUBKEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAELP6AflXwsuZ5q4NDIO0LP2iCdKRvds4nwsUmRhOw3g=
-----END PUBLIC KEY-----`;
*/

const ED448_CERT = `-----BEGIN CERTIFICATE-----
MIIBijCCAQqgAwIBAgIUZaCS7zEjOnQ7O4KUFym6fJF5vl8wBQYDK2VxMBUxEzAR
BgNVBAMMCkVkNDQ4IFRlc3QwHhcNMjMxMDE1MDAyMzI1WhcNMzMxMDEyMDAyMzI1
WjAVMRMwEQYDVQQDDApFZDQ0OCBUZXN0MEMwBQYDK2VxAzoAVN8kG0TMVyGOu/Ov
BTe8H0Wi4HJrQAlSv4XLwJbkuoi4EeRlEHQwXsNYLZTtY2Jra6AWhbVYYaEAo1Mw
UTAdBgNVHQ4EFgQUJFrepAf9YXrmDMSAzrMeYQmosd0wHwYDVR0jBBgwFoAUJFre
pAf9YXrmDMSAzrMeYQmosd0wDwYDVR0TAQH/BAUwAwEB/zAFBgMrZXEDcwA+YiZj
puFr2aogfV1qg/ixk7qLi25BbKVNR6+7PEUjo7+4yBn9qnLbAHUGnHn7E96pSey9
VkLqpoDNMRcM3Eb6h3AJpQM0oxGj8q9arjDXqJkXgaO2e0tVn8KKVfy7S8qO72Kd
rWzZowcOjnWKhXm7JgA=
-----END CERTIFICATE-----`;

/*
const ED448_PUBKEY = `-----BEGIN PUBLIC KEY-----
MEMwBQYDK2VxAzoAVN8kG0TMVyGOu/OvBTe8H0Wi4HJrQAlSv4XLwJbkuoi4EeRl
EHQwXsNYLZTtY2Jra6AWhbVYYaEA
-----END PUBLIC KEY-----`
*/

TestRegister.addTests([
    {
        name: "Public Key from Certificate: Missing footer",
        input: RSA_CERT.substring(0, RSA_CERT.length / 2),
        expectedOutput: "PEM footer '-----END CERTIFICATE-----' not found",
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },

    // test RSA certificate
    {
        name: "Public Key from Certificate: RSA",
        input: RSA_CERT,
        expectedOutput: (RSA_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },

    // test EC certificate
    {
        name: "Public Key from Certificate: EC",
        input: EC_P256_CERT,
        expectedOutput: (EC_P256_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },

    // test DSA certificate
    {
        name: "Public Key from Certificate: DSA",
        input: DSA_CERT,
        expectedOutput: (DSA_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },

    // test EdDSA certificates
    {
        name: "Public Key from Certificate: Ed25519",
        input: ED25519_CERT,
        expectedOutput: "Unsupported public key type",
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from Certificate: Ed448",
        input: ED448_CERT,
        expectedOutput: "Unsupported public key type",
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },

    // test multi-input
    {
        name: "Public Key from Certificate: Multiple certificates",
        input: RSA_CERT + "\n" + EC_P256_CERT,
        expectedOutput: (RSA_PUBKEY + "\n" + EC_P256_PUBKEY + "\n").replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    }
]);
