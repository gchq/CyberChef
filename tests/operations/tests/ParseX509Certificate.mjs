/**
 * Parse X.509 Certificate tests.
 *
 * Added as part of the jsrsasign → @peculiar/x509 migration (PR 5) to give
 * the operation regression coverage it previously lacked.  The certificate
 * fixtures are reused from PubKeyFromCert.mjs.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
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

const RSA_EXPECTED = `Version:          3 (0x02)
Serial number:    697456755083946472681082503344832984412880816345 (0x7a2b0ae4dc2cb360c68393c2b38b92c715f2c8d9)
Algorithm ID:     SHA256withRSA
Validity
  Not Before:     19/11/2021 17:20:26 (dd-mm-yyyy hh:mm:ss) (211119172026Z)
  Not After:      17/11/2031 17:20:26 (dd-mm-yyyy hh:mm:ss) (311117172026Z)
Issuer
  CN = RSA test
Subject
  CN = RSA test
Fingerprints
  MD5:            0807638eee1403fbcacc1b6d25e00d95
  SHA1:           cae48f6fac74e143e10e0d8db1597385d62f24c4
  SHA256:         cd9125e6e7caa729c766e4d9ed84ef44e6bc57d00614c5f051af661e9ce3e436
Public Key
  Algorithm:      RSA
  Length:         512 bits
  Modulus:        f2:ab:d0:3a:7a:61:d2:2d:cc:e7:e4:e9:ae:e6:6b:b2:
                  f8:04:5e:0b:9d:e9:4c:60:ab:5b:a0:62:eb:93:a8:a1:
                  b6:a1:4f:64:54:4b:35:c2:62:eb:c1:ef:9e:df:2c:b4:
                  ca:cf:e7:4b:7a:8e:ac:16:43:61:23:31:d9:23:e9:fb
  Exponent:       65537 (0x10001)
Certificate Signature
  Algorithm:      SHA256withRSA
  Signature:      47:fe:47:01:93:39:a8:18:54:fd:ec:c3:50:81:71:82:
                  65:06:a0:56:c8:6f:99:09:0f:8d:58:0a:76:92:76:b8:
                  16:82:58:78:1d:ee:26:7a:54:ac:e3:61:bf:a3:10:41:
                  8e:e0:89:d1:b5:29:a9:69:cb:97:e9:49:92:fd:73:20

Extensions
  subjectKeyIdentifier :
    4efa3be4aaae69a67420c0c327468ba7e9eede89
  authorityKeyIdentifier :
    kid=4efa3be4aaae69a67420c0c327468ba7e9eede89
  basicConstraints CRITICAL:
    cA=true`;

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

const EC_P256_EXPECTED = `Version:          3 (0x02)
Serial number:    248385364994530420657018049397175541334954026141 (0x2b81fc2771ebecda512cfac00a3f0f8dee09249d)
Algorithm ID:     SHA256withECDSA
Validity
  Not Before:     19/11/2021 17:19:45 (dd-mm-yyyy hh:mm:ss) (211119171945Z)
  Not After:      17/11/2031 17:19:45 (dd-mm-yyyy hh:mm:ss) (311117171945Z)
Issuer
  CN = P-256 test
Subject
  CN = P-256 test
Fingerprints
  MD5:            d58a07c73ac5353acd1799174472478f
  SHA1:           562feb8b1a2c9808a98b350557ab80eab619ed48
  SHA256:         584662f4632e221a1d58f91f772fb6f617af7aa3d8542281af2efcc93c1b79eb
Public Key
  Algorithm:      EC
  Curve Name:     secp256r1
  Length:         256 bits
  pub:            04:0d:47:3c:03:41:03:34:aa:02:60:83:d6:30:7c:f5:
                  c9:4c:ea:13:99:89:82:eb:20:70:01:3c:1f:af:35:d1:
                  f9:09:f1:99:93:36:20:82:6b:ab:0b:81:1d:af:0f:55:
                  4d:87:67:62:8a:b5:a0:28:f1:f8:3d:53:0a:6a:fe:5e:
                  e9
Certificate Signature
  Algorithm:      SHA256withECDSA
  r:              54:f4:fa:ce:6b:f9:17:0a:94:d3:04:89:d1:7f:fb:0d:
                  69:cd:a2:0c:79:9b:76:95:b3:71:72:3e:c4:b2:8d:60
  s:              84:51:d4:b4:52:1d:5c:0e:4c:b4:3f:88:15:dd:fb:c2:
                  c2:92:6e:5a:4c:1d:bb:45:6e:3a:2c:df:34:ca:5c:6d

Extensions
  subjectKeyIdentifier :
    fd2c68757ae99326cc81c2209319d129dec7333a
  authorityKeyIdentifier :
    kid=fd2c68757ae99326cc81c2209319d129dec7333a
  basicConstraints CRITICAL:
    cA=true`;

TestRegister.addTests([
    {
        name: "Parse X.509 certificate: No input",
        input: "",
        expectedOutput: "No input",
        recipeConfig: [
            { op: "Parse X.509 certificate", args: ["PEM"] }
        ],
    },
    {
        name: "Parse X.509 certificate: RSA / PEM",
        input: RSA_CERT,
        expectedOutput: RSA_EXPECTED,
        recipeConfig: [
            { op: "Parse X.509 certificate", args: ["PEM"] }
        ],
    },
    {
        name: "Parse X.509 certificate: EC P-256 / PEM",
        input: EC_P256_CERT,
        expectedOutput: EC_P256_EXPECTED,
        recipeConfig: [
            { op: "Parse X.509 certificate", args: ["PEM"] }
        ],
    },
]);
