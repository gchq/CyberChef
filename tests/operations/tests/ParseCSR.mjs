/**
 * Parse CSR tests.
 *
 * @author jkataja
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

// openssl req -newkey rsa:1024 -keyout test-rsa-1024.key -out test-rsa-1024.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_RSA_1024 = `-----BEGIN CERTIFICATE REQUEST-----
MIICHzCCAYgCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCBnzANBgkqhkiG9w0BAQEF
AAOBjQAwgYkCgYEArrTrLI6FkzjX8FZfclt2ox1Dz7KRwt5f6ffZic7twLAKJ4ao
/H3APjwoFVUXGjiNj/XF2RlId4UxB1b6CgWjujBb9W51rTdvfWLyAHsrLcptpVz+
V9Y8X9kEFCRGGDyG5+X+Nu6COzTpUPDj4bIIX/uPk3fDYDEqLClVy8/VS48CAwEA
AaBtMGsGCSqGSIb3DQEJDjFeMFwwJwYDVR0RBCAwHoILZXhhbXBsZS5jb22CD3d3
dy5leGFtcGxlLmNvbTAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0BAQsFAAOBgQB0mUlPgt6pt/kjD0pz
OUNk5e9nBFQYQGuGIHGYbPX3mi4Wd9vUCdPixtPSTunHWs2cxX2nM8+MdcNTY+7Q
NFgFNIvSXhbqMYoHAAApMHJOxiWpBFdYKp3tESnlgh2lUh7lQtmOjD4a1dzfU8PU
oViyp+UJGasN2WRd+4VtaPw64w==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_RSA_1024 = `Version:          1 (0x00)
Subject
  C = CH
  ST = Zurich
  L = Zurich
  O = Example RE
  OU = IT Department
  CN = example.com
Subject Alternative Names
  DNS: example.com
  DNS: www.example.com
Public Key
  Algorithm:      RSA
  Length:         1024 bits
  Modulus:        ae:b4:eb:2c:8e:85:93:38:d7:f0:56:5f:72:5b:76:a3:
                  1d:43:cf:b2:91:c2:de:5f:e9:f7:d9:89:ce:ed:c0:b0:
                  0a:27:86:a8:fc:7d:c0:3e:3c:28:15:55:17:1a:38:8d:
                  8f:f5:c5:d9:19:48:77:85:31:07:56:fa:0a:05:a3:ba:
                  30:5b:f5:6e:75:ad:37:6f:7d:62:f2:00:7b:2b:2d:ca:
                  6d:a5:5c:fe:57:d6:3c:5f:d9:04:14:24:46:18:3c:86:
                  e7:e5:fe:36:ee:82:3b:34:e9:50:f0:e3:e1:b2:08:5f:
                  fb:8f:93:77:c3:60:31:2a:2c:29:55:cb:cf:d5:4b:8f
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      sha256WithRSAEncryption
  Signature:      74:99:49:4f:82:de:a9:b7:f9:23:0f:4a:73:39:43:64:
                  e5:ef:67:04:54:18:40:6b:86:20:71:98:6c:f5:f7:9a:
                  2e:16:77:db:d4:09:d3:e2:c6:d3:d2:4e:e9:c7:5a:cd:
                  9c:c5:7d:a7:33:cf:8c:75:c3:53:63:ee:d0:34:58:05:
                  34:8b:d2:5e:16:ea:31:8a:07:00:00:29:30:72:4e:c6:
                  25:a9:04:57:58:2a:9d:ed:11:29:e5:82:1d:a5:52:1e:
                  e5:42:d9:8e:8c:3e:1a:d5:dc:df:53:c3:d4:a1:58:b2:
                  a7:e5:09:19:ab:0d:d9:64:5d:fb:85:6d:68:fc:3a:e3
Extensions
  basicConstraints CRITICAL:
    CA = false
  keyUsage CRITICAL:
    Digital signature
    Key encipherment
  extKeyUsage:
    TLS Web Server Authentication`;

// openssl req -newkey rsa:2048 -keyout test-rsa-2048.key -out test-rsa-2048.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_RSA_2048 = `-----BEGIN CERTIFICATE REQUEST-----
MIIDJDCCAgwCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAKPogLmWPuK/IGdct2v/3MFKVaVeKp2Hl5at/zDFLCAe
51bwh7BqNVJEci4ApwlXA1WVmQPBFBJlYwQZVjz5UAN2CmNHxud5nV03YmZ2/Iml
RzpKcZMPqU+liJCC04L+XIbOdx+Vz52dF++Cc+FuSFq803yW+qefK8JsJNO9KuPx
RLYKSAADa9MIJisru1PzcBAOcimOmNnFWuo+LKsd4lU30OExDdKHwtyt62Mj1c3o
lO1JjvkjtWWjwHI+0EgTjvkeXlcUYZvvLlysdKERMRozvMTGqqoHWCgWl+Rq9Z6P
TgNsRO4CKug1Zwmh8y6acZ7sYb/dar8HOeqJnc0pCv8CAwEAAaBtMGsGCSqGSIb3
DQEJDjFeMFwwJwYDVR0RBCAwHoILZXhhbXBsZS5jb22CD3d3dy5leGFtcGxlLmNv
bTAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEF
BQcDATANBgkqhkiG9w0BAQsFAAOCAQEAG0cjfRBY1pBzu+jf7yMQrK5mQrh72air
VuXHmochmyUxyt0G7ovnNhKEr+X9snShJLi5qlyvnb2roiwlCmuwGIZxErN1svQL
Z3kQNZgH+Vyu5IRL2DlPs5AAxVmzPpbnbXNhMHyAK/ziLcU031O1PoCpxwfvPsjW
HWOCjbZUVaJnxdp8AHqImoGAiVhJwc37feFvb2UQlLedUypQkPg/poNWduaRDoj8
m9cpVxuxGLtONBnohzohnFECytSXWEXPIj8L9SpYK97G02nJYYCAcb5BF11Alfux
sNxtsr6zgPaLRrvOBT11WxJVKerbhfezAJ3naem1eM3VLxCGWwMwxg==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_RSA_2048 = `Version:          1 (0x00)
Subject
  C = CH
  ST = Zurich
  L = Zurich
  O = Example RE
  OU = IT Department
  CN = example.com
Subject Alternative Names
  DNS: example.com
  DNS: www.example.com
Public Key
  Algorithm:      RSA
  Length:         2048 bits
  Modulus:        a3:e8:80:b9:96:3e:e2:bf:20:67:5c:b7:6b:ff:dc:c1:
                  4a:55:a5:5e:2a:9d:87:97:96:ad:ff:30:c5:2c:20:1e:
                  e7:56:f0:87:b0:6a:35:52:44:72:2e:00:a7:09:57:03:
                  55:95:99:03:c1:14:12:65:63:04:19:56:3c:f9:50:03:
                  76:0a:63:47:c6:e7:79:9d:5d:37:62:66:76:fc:89:a5:
                  47:3a:4a:71:93:0f:a9:4f:a5:88:90:82:d3:82:fe:5c:
                  86:ce:77:1f:95:cf:9d:9d:17:ef:82:73:e1:6e:48:5a:
                  bc:d3:7c:96:fa:a7:9f:2b:c2:6c:24:d3:bd:2a:e3:f1:
                  44:b6:0a:48:00:03:6b:d3:08:26:2b:2b:bb:53:f3:70:
                  10:0e:72:29:8e:98:d9:c5:5a:ea:3e:2c:ab:1d:e2:55:
                  37:d0:e1:31:0d:d2:87:c2:dc:ad:eb:63:23:d5:cd:e8:
                  94:ed:49:8e:f9:23:b5:65:a3:c0:72:3e:d0:48:13:8e:
                  f9:1e:5e:57:14:61:9b:ef:2e:5c:ac:74:a1:11:31:1a:
                  33:bc:c4:c6:aa:aa:07:58:28:16:97:e4:6a:f5:9e:8f:
                  4e:03:6c:44:ee:02:2a:e8:35:67:09:a1:f3:2e:9a:71:
                  9e:ec:61:bf:dd:6a:bf:07:39:ea:89:9d:cd:29:0a:ff
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      sha256WithRSAEncryption
  Signature:      1b:47:23:7d:10:58:d6:90:73:bb:e8:df:ef:23:10:ac:
                  ae:66:42:b8:7b:d9:a8:ab:56:e5:c7:9a:87:21:9b:25:
                  31:ca:dd:06:ee:8b:e7:36:12:84:af:e5:fd:b2:74:a1:
                  24:b8:b9:aa:5c:af:9d:bd:ab:a2:2c:25:0a:6b:b0:18:
                  86:71:12:b3:75:b2:f4:0b:67:79:10:35:98:07:f9:5c:
                  ae:e4:84:4b:d8:39:4f:b3:90:00:c5:59:b3:3e:96:e7:
                  6d:73:61:30:7c:80:2b:fc:e2:2d:c5:34:df:53:b5:3e:
                  80:a9:c7:07:ef:3e:c8:d6:1d:63:82:8d:b6:54:55:a2:
                  67:c5:da:7c:00:7a:88:9a:81:80:89:58:49:c1:cd:fb:
                  7d:e1:6f:6f:65:10:94:b7:9d:53:2a:50:90:f8:3f:a6:
                  83:56:76:e6:91:0e:88:fc:9b:d7:29:57:1b:b1:18:bb:
                  4e:34:19:e8:87:3a:21:9c:51:02:ca:d4:97:58:45:cf:
                  22:3f:0b:f5:2a:58:2b:de:c6:d3:69:c9:61:80:80:71:
                  be:41:17:5d:40:95:fb:b1:b0:dc:6d:b2:be:b3:80:f6:
                  8b:46:bb:ce:05:3d:75:5b:12:55:29:ea:db:85:f7:b3:
                  00:9d:e7:69:e9:b5:78:cd:d5:2f:10:86:5b:03:30:c6
Extensions
  basicConstraints CRITICAL:
    CA = false
  keyUsage CRITICAL:
    Digital signature
    Key encipherment
  extKeyUsage:
    TLS Web Server Authentication`;

// openssl genpkey -genparam -algorithm ec -pkeyopt ec_paramgen_curve:P-256 -out test-ec-param.pem
// openssl req -newkey ec:test-ec-param.pem -keyout test-ec.key -out test-ec.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_EC = `-----BEGIN CERTIFICATE REQUEST-----
MIIBmzCCAUECAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqG
SM49AwEHA0IABAmpYXNh+L9E0Q3sLhrO+MF1XgKCfqJntrOyIkrGwoiQftHbJWTA
6duxQhU/3d9B+SN/ibeKY+xeiNBrs2eTYZ6gbTBrBgkqhkiG9w0BCQ4xXjBcMCcG
A1UdEQQgMB6CC2V4YW1wbGUuY29tgg93d3cuZXhhbXBsZS5jb20wDAYDVR0TAQH/
BAIwADAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYBBQUHAwEwCgYIKoZI
zj0EAwIDSAAwRQIgQkum/qaLzE3QZ3WD00uLpalUn113FObd7rM5Mr3HQwQCIQCr
7OjzYI9v7qIJp/E9N16XfJN87G2ZVIZ4FuPXVjokCQ==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_EC = `Parse CSR - Cannot read public key. OID is not RSA.`;

TestRegister.addTests([
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with RSA 1024",
        input: IN_EXAMPLE_COM_RSA_1024,
        expectedOutput: OUT_EXAMPLE_COM_RSA_1024,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM", true]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with RSA 2048",
        input: IN_EXAMPLE_COM_RSA_2048,
        expectedOutput: OUT_EXAMPLE_COM_RSA_2048,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM", true]
            }
        ]
    },
    // RSA algorithm is the only one supported for CSR in node-forge as of 1.3.1
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with EC 256",
        input: IN_EXAMPLE_COM_EC,
        expectedError: true,
        expectedOutput: OUT_EXAMPLE_COM_EC,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM", true]
            }
        ]
    }
]);
