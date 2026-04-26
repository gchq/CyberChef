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

const OUT_EXAMPLE_COM_RSA_1024 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      RSA
  Length:         1024 bits
  Modulus:        00:ae:b4:eb:2c:8e:85:93:38:d7:f0:56:5f:72:5b:76:
                  a3:1d:43:cf:b2:91:c2:de:5f:e9:f7:d9:89:ce:ed:c0:
                  b0:0a:27:86:a8:fc:7d:c0:3e:3c:28:15:55:17:1a:38:
                  8d:8f:f5:c5:d9:19:48:77:85:31:07:56:fa:0a:05:a3:
                  ba:30:5b:f5:6e:75:ad:37:6f:7d:62:f2:00:7b:2b:2d:
                  ca:6d:a5:5c:fe:57:d6:3c:5f:d9:04:14:24:46:18:3c:
                  86:e7:e5:fe:36:ee:82:3b:34:e9:50:f0:e3:e1:b2:08:
                  5f:fb:8f:93:77:c3:60:31:2a:2c:29:55:cb:cf:d5:4b:
                  8f
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      SHA256withRSA
  Signature:      74:99:49:4f:82:de:a9:b7:f9:23:0f:4a:73:39:43:64:
                  e5:ef:67:04:54:18:40:6b:86:20:71:98:6c:f5:f7:9a:
                  2e:16:77:db:d4:09:d3:e2:c6:d3:d2:4e:e9:c7:5a:cd:
                  9c:c5:7d:a7:33:cf:8c:75:c3:53:63:ee:d0:34:58:05:
                  34:8b:d2:5e:16:ea:31:8a:07:00:00:29:30:72:4e:c6:
                  25:a9:04:57:58:2a:9d:ed:11:29:e5:82:1d:a5:52:1e:
                  e5:42:d9:8e:8c:3e:1a:d5:dc:df:53:c3:d4:a1:58:b2:
                  a7:e5:09:19:ab:0d:d9:64:5d:fb:85:6d:68:fc:3a:e3
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

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

const OUT_EXAMPLE_COM_RSA_2048 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      RSA
  Length:         2048 bits
  Modulus:        00:a3:e8:80:b9:96:3e:e2:bf:20:67:5c:b7:6b:ff:dc:
                  c1:4a:55:a5:5e:2a:9d:87:97:96:ad:ff:30:c5:2c:20:
                  1e:e7:56:f0:87:b0:6a:35:52:44:72:2e:00:a7:09:57:
                  03:55:95:99:03:c1:14:12:65:63:04:19:56:3c:f9:50:
                  03:76:0a:63:47:c6:e7:79:9d:5d:37:62:66:76:fc:89:
                  a5:47:3a:4a:71:93:0f:a9:4f:a5:88:90:82:d3:82:fe:
                  5c:86:ce:77:1f:95:cf:9d:9d:17:ef:82:73:e1:6e:48:
                  5a:bc:d3:7c:96:fa:a7:9f:2b:c2:6c:24:d3:bd:2a:e3:
                  f1:44:b6:0a:48:00:03:6b:d3:08:26:2b:2b:bb:53:f3:
                  70:10:0e:72:29:8e:98:d9:c5:5a:ea:3e:2c:ab:1d:e2:
                  55:37:d0:e1:31:0d:d2:87:c2:dc:ad:eb:63:23:d5:cd:
                  e8:94:ed:49:8e:f9:23:b5:65:a3:c0:72:3e:d0:48:13:
                  8e:f9:1e:5e:57:14:61:9b:ef:2e:5c:ac:74:a1:11:31:
                  1a:33:bc:c4:c6:aa:aa:07:58:28:16:97:e4:6a:f5:9e:
                  8f:4e:03:6c:44:ee:02:2a:e8:35:67:09:a1:f3:2e:9a:
                  71:9e:ec:61:bf:dd:6a:bf:07:39:ea:89:9d:cd:29:0a:
                  ff
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      SHA256withRSA
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
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl genpkey -genparam -algorithm ec -pkeyopt ec_paramgen_curve:P-256 -out test-ec-param.pem
// openssl req -newkey ec:test-ec-param.pem -keyout test-ec.key -out test-ec.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_EC_P256 = `-----BEGIN CERTIFICATE REQUEST-----
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

const OUT_EXAMPLE_COM_EC_P256 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      ECDSA
  Length:         256 bits
  Pub:            04:09:a9:61:73:61:f8:bf:44:d1:0d:ec:2e:1a:ce:f8:
                  c1:75:5e:02:82:7e:a2:67:b6:b3:b2:22:4a:c6:c2:88:
                  90:7e:d1:db:25:64:c0:e9:db:b1:42:15:3f:dd:df:41:
                  f9:23:7f:89:b7:8a:63:ec:5e:88:d0:6b:b3:67:93:61:
                  9e
  ASN1 OID:       secp256r1
  NIST CURVE:     P-256
Signature
  Algorithm:      SHA256withECDSA
  Signature:      30:45:02:20:42:4b:a6:fe:a6:8b:cc:4d:d0:67:75:83:
                  d3:4b:8b:a5:a9:54:9f:5d:77:14:e6:dd:ee:b3:39:32:
                  bd:c7:43:04:02:21:00:ab:ec:e8:f3:60:8f:6f:ee:a2:
                  09:a7:f1:3d:37:5e:97:7c:93:7c:ec:6d:99:54:86:78:
                  16:e3:d7:56:3a:24:09
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl ecparam -name secp384r1 -genkey -noout -out test-ec-key.pem
// openssl req -new -key test-ec-key.pem -out test-ec.csr
// -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com"
// -addext "subjectAltName = DNS:example.com,DNS:www.example.com"
// -addext "basicConstraints = critical,CA:FALSE"
// -addext "keyUsage = critical,digitalSignature,keyEncipherment"
// -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_EC_P384 = `-----BEGIN CERTIFICATE REQUEST-----
MIIB2TCCAV4CAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTB2MBAGByqGSM49AgEGBSuB
BAAiA2IABE3rpRO164NtXx2kYMP1zlN7YgHEincO4YgwoyAYyJm3LwcbR+XyKg6A
/i+DUaGWa2FQ+f8w8VmEUFAgLozVxwnntPOCSODrXAQwJFPLCqs7m3o8OuzU3t07
POGhPtj7f6BtMGsGCSqGSIb3DQEJDjFeMFwwJwYDVR0RBCAwHoILZXhhbXBsZS5j
b22CD3d3dy5leGFtcGxlLmNvbTAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIF
oDATBgNVHSUEDDAKBggrBgEFBQcDATAKBggqhkjOPQQDAgNpADBmAjEAlq7RaEXU
aNHEC+qfuIitonWHOatm+qiiaNSh80QjLw5P1rszg9yQQigHd8cD7I4DAjEAzmo1
DLpcESwZCBrh3sPflDA38TZjoedRNeWcVxdn1QmwDWMeprD/zgPAey8GOmyj
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_EC_P384 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      ECDSA
  Length:         384 bits
  Pub:            04:4d:eb:a5:13:b5:eb:83:6d:5f:1d:a4:60:c3:f5:ce:
                  53:7b:62:01:c4:8a:77:0e:e1:88:30:a3:20:18:c8:99:
                  b7:2f:07:1b:47:e5:f2:2a:0e:80:fe:2f:83:51:a1:96:
                  6b:61:50:f9:ff:30:f1:59:84:50:50:20:2e:8c:d5:c7:
                  09:e7:b4:f3:82:48:e0:eb:5c:04:30:24:53:cb:0a:ab:
                  3b:9b:7a:3c:3a:ec:d4:de:dd:3b:3c:e1:a1:3e:d8:fb:
                  7f
  ASN1 OID:       secp384r1
  NIST CURVE:     P-384
Signature
  Algorithm:      SHA256withECDSA
  Signature:      30:66:02:31:00:96:ae:d1:68:45:d4:68:d1:c4:0b:ea:
                  9f:b8:88:ad:a2:75:87:39:ab:66:fa:a8:a2:68:d4:a1:
                  f3:44:23:2f:0e:4f:d6:bb:33:83:dc:90:42:28:07:77:
                  c7:03:ec:8e:03:02:31:00:ce:6a:35:0c:ba:5c:11:2c:
                  19:08:1a:e1:de:c3:df:94:30:37:f1:36:63:a1:e7:51:
                  35:e5:9c:57:17:67:d5:09:b0:0d:63:1e:a6:b0:ff:ce:
                  03:c0:7b:2f:06:3a:6c:a3
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl ecparam -name secp521r1 -genkey -noout -out test-ec-key.pem
// openssl req -new -key test-ec-key.pem -out test-ec.csr
// -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com"
// -addext "subjectAltName = DNS:example.com,DNS:www.example.com"
// -addext "basicConstraints = critical,CA:FALSE"
// -addext "keyUsage = critical,digitalSignature,keyEncipherment"
// -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_EC_P521 = `-----BEGIN CERTIFICATE REQUEST-----
MIICIjCCAYQCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCBmzAQBgcqhkjOPQIBBgUr
gQQAIwOBhgAEAKf5BRB57svfglRz5dM0bnJAnieMFjNjOFca5/pJ2bOpORkp9Uol
x//mHY5WOMYYC/xvM5lJRcmUnL791zQ6rf6pAD/CrEpDF2svae6e5nA/fN2XsB98
xjmkTpYZVC5nFT83Ceo9J0kHbvliYlAMsEOO60qGghyWV7myiDgORfE+POU3oG0w
awYJKoZIhvcNAQkOMV4wXDAnBgNVHREEIDAeggtleGFtcGxlLmNvbYIPd3d3LmV4
YW1wbGUuY29tMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQM
MAoGCCsGAQUFBwMBMAoGCCqGSM49BAMCA4GLADCBhwJBDeIpSuvIT+kiE0ZnJwPS
DVik93CLqjFm5Ieq02d81GwusSgAA82WlZZVZRsTEjkZXtk96zMBnh5/uxk+wN+j
+PoCQgEDmXREwi0BPkHj6QlktE+7SLELVkrd75D9mfw/SV6ZJiLiLIT9yeoA0Zon
uhcl2rK/DLQutuJF6JIBe5s7lieKfQ==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_EC_P521 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      ECDSA
  Length:         521 bits
  Pub:            04:00:a7:f9:05:10:79:ee:cb:df:82:54:73:e5:d3:34:
                  6e:72:40:9e:27:8c:16:33:63:38:57:1a:e7:fa:49:d9:
                  b3:a9:39:19:29:f5:4a:25:c7:ff:e6:1d:8e:56:38:c6:
                  18:0b:fc:6f:33:99:49:45:c9:94:9c:be:fd:d7:34:3a:
                  ad:fe:a9:00:3f:c2:ac:4a:43:17:6b:2f:69:ee:9e:e6:
                  70:3f:7c:dd:97:b0:1f:7c:c6:39:a4:4e:96:19:54:2e:
                  67:15:3f:37:09:ea:3d:27:49:07:6e:f9:62:62:50:0c:
                  b0:43:8e:eb:4a:86:82:1c:96:57:b9:b2:88:38:0e:45:
                  f1:3e:3c:e5:37
  ASN1 OID:       secp521r1
  NIST CURVE:     P-521
Signature
  Algorithm:      SHA256withECDSA
  Signature:      30:81:87:02:41:0d:e2:29:4a:eb:c8:4f:e9:22:13:46:
                  67:27:03:d2:0d:58:a4:f7:70:8b:aa:31:66:e4:87:aa:
                  d3:67:7c:d4:6c:2e:b1:28:00:03:cd:96:95:96:55:65:
                  1b:13:12:39:19:5e:d9:3d:eb:33:01:9e:1e:7f:bb:19:
                  3e:c0:df:a3:f8:fa:02:42:01:03:99:74:44:c2:2d:01:
                  3e:41:e3:e9:09:64:b4:4f:bb:48:b1:0b:56:4a:dd:ef:
                  90:fd:99:fc:3f:49:5e:99:26:22:e2:2c:84:fd:c9:ea:
                  00:d1:9a:27:ba:17:25:da:b2:bf:0c:b4:2e:b6:e2:45:
                  e8:92:01:7b:9b:3b:96:27:8a:7d
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl dsaparam -out dsaparam.pem 1024
// openssl gendsa -out dsakey.pem dsaparam.pem
// openssl req -new -key dsakey.pem -out test-dsa.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_DSA_1024 = `-----BEGIN CERTIFICATE REQUEST-----
MIIC/jCCAqoCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCAcAwggE0BgcqhkjOOAQB
MIIBJwKBgQD8vvCmdM8wttdbq3kWigTEnnug4+2SLMl2RNXrlCQjmuZc7tGMyP1u
gsSc9Pxd/tMrPKRawFP5SvUOkZ4cIrujdJVTb/hlfnGH4cWACe8EupwRzoqwZB1x
awiHFzL9G6Go0HOy7bSbRdxBIYu46fnxNsDFf7lMlcBOKdq4Y12kvwIdAN4/vtK9
KxhQfcrrzHsPXW+/xW0CMfr+NQir8PkCgYEAiNdM7IRZhXPaGRtGDpepSoRAf4uQ
LWY9q+vFUx4fVRSSgwKBKLjW+BvzE2eJq0pXv7O09QHOghtcwzY3UrdN952sjUkJ
LItt+5FxB7/JqCBPRrrVsyGEjR3+WbeI3wl6OvQFxm/OTNTTkemFdAfpT/YDSw+n
1xLODTfegT/oyOoDgYUAAoGBAMz15lRPVAj8cje3ShbuACHPVE85d0Tk0Dw9qUcQ
NCNS6A3STSbUiLGKeiRMGg2v/HM9ivV8tq1rywmgBAwtidcQ6P5yqYSZs6z3x9xZ
OzeQ5jXftBQ1GXeU8zi1fC99inFGNixbPFVIz4/KiV0+So44n9ki2ylhbz0YQtpU
wMF+oG0wawYJKoZIhvcNAQkOMV4wXDAnBgNVHREEIDAeggtleGFtcGxlLmNvbYIP
d3d3LmV4YW1wbGUuY29tMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgWgMBMG
A1UdJQQMMAoGCCsGAQUFBwMBMAsGCWCGSAFlAwQDAgNBADA+Ah0AkTogUUyKE5v9
ezKrOKpP07i2E9Zz0n/yjIvw4wIdAMB5yVMOEgI877vOFQ7zzf7oDR9eJMYlf4QV
2sQ=
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_DSA_1024 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      DSA
  Length:         1024 bits
  Pub:            00:cc:f5:e6:54:4f:54:08:fc:72:37:b7:4a:16:ee:00:
                  21:cf:54:4f:39:77:44:e4:d0:3c:3d:a9:47:10:34:23:
                  52:e8:0d:d2:4d:26:d4:88:b1:8a:7a:24:4c:1a:0d:af:
                  fc:73:3d:8a:f5:7c:b6:ad:6b:cb:09:a0:04:0c:2d:89:
                  d7:10:e8:fe:72:a9:84:99:b3:ac:f7:c7:dc:59:3b:37:
                  90:e6:35:df:b4:14:35:19:77:94:f3:38:b5:7c:2f:7d:
                  8a:71:46:36:2c:5b:3c:55:48:cf:8f:ca:89:5d:3e:4a:
                  8e:38:9f:d9:22:db:29:61:6f:3d:18:42:da:54:c0:c1:
                  7e
  P:              00:fc:be:f0:a6:74:cf:30:b6:d7:5b:ab:79:16:8a:04:
                  c4:9e:7b:a0:e3:ed:92:2c:c9:76:44:d5:eb:94:24:23:
                  9a:e6:5c:ee:d1:8c:c8:fd:6e:82:c4:9c:f4:fc:5d:fe:
                  d3:2b:3c:a4:5a:c0:53:f9:4a:f5:0e:91:9e:1c:22:bb:
                  a3:74:95:53:6f:f8:65:7e:71:87:e1:c5:80:09:ef:04:
                  ba:9c:11:ce:8a:b0:64:1d:71:6b:08:87:17:32:fd:1b:
                  a1:a8:d0:73:b2:ed:b4:9b:45:dc:41:21:8b:b8:e9:f9:
                  f1:36:c0:c5:7f:b9:4c:95:c0:4e:29:da:b8:63:5d:a4:
                  bf
  Q:              00:de:3f:be:d2:bd:2b:18:50:7d:ca:eb:cc:7b:0f:5d:
                  6f:bf:c5:6d:02:31:fa:fe:35:08:ab:f0:f9
  G:              00:88:d7:4c:ec:84:59:85:73:da:19:1b:46:0e:97:a9:
                  4a:84:40:7f:8b:90:2d:66:3d:ab:eb:c5:53:1e:1f:55:
                  14:92:83:02:81:28:b8:d6:f8:1b:f3:13:67:89:ab:4a:
                  57:bf:b3:b4:f5:01:ce:82:1b:5c:c3:36:37:52:b7:4d:
                  f7:9d:ac:8d:49:09:2c:8b:6d:fb:91:71:07:bf:c9:a8:
                  20:4f:46:ba:d5:b3:21:84:8d:1d:fe:59:b7:88:df:09:
                  7a:3a:f4:05:c6:6f:ce:4c:d4:d3:91:e9:85:74:07:e9:
                  4f:f6:03:4b:0f:a7:d7:12:ce:0d:37:de:81:3f:e8:c8:
                  ea
Signature
  Algorithm:      SHA256withDSA
  Signature:
      R:          00:91:3a:20:51:4c:8a:13:9b:fd:7b:32:ab:38:aa:4f:
                  d3:b8:b6:13:d6:73:d2:7f:f2:8c:8b:f0:e3
      S:          00:c0:79:c9:53:0e:12:02:3c:ef:bb:ce:15:0e:f3:cd:
                  fe:e8:0d:1f:5e:24:c6:25:7f:84:15:da:c4
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl dsaparam -out dsaparam.pem 2048
// openssl gendsa -out dsakey.pem dsaparam.pem
// openssl req -new -key dsakey.pem -out test-dsa.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_DSA_2048 = `-----BEGIN CERTIFICATE REQUEST-----
MIIEfzCCBCwCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCA0IwggI1BgcqhkjOOAQB
MIICKAKCAQEAsvoKmCHcR2y8qQ/kpBHOvlaGifq//F/0zhWSpfjvwqI3g2EjqXL7
rCYyu9wxoogODo6Dnenxfw1xp3ZIJNCtfrSJyt0AudjOedtVWMSnTndoQVQtYSI0
mmrBAqFL26i1bmEMxsd6pz2nU3p8yGY/wpYiWwyy+/TZv8a2t58owpw9Qkm4cX4E
Po3ih/XbN6eooOx9ZaErcS9mg3UvwQDm0VYD3ZjSeqwP7YWGyhq7gPJsEiMrft12
1SjyNz8rkhXzqZFRujjmfTT5dpCC/Z4d7/ZE30tbqHaNDM+YwBrb/aL7PnoWs847
VpjCVxmVmgIPoMHlTbg29RsIUoFlFScaUQIdAMGwwpzilrReaEqcoX7PY5u4vtV0
5zuiVIqkdBMCggEAQZhk5qdAYoMvZhPi5TOgysTzQE1FeAEtgypxZI65TpwO/JOr
AX9vYZ/qCYX/ncj455qiPZenl59lo/iQPzhJUubuCevPWJ3dsKRbAyL/5NCwifnf
YBMJGj0UFGL4ekVV0emLL9H5eqYz64w0eV2Sp40O8yCu0qr7QTi3zpqzJZ43E+26
Z9bgR6c1lmgKW2QN72PHwMlTlq0O6mN+eikEWoGr09JWpXMThZemAO2mHLAiq6ju
0+zduzWZyjZPZA1B4XUlTgCtzHveYpUzZ1NhZyM8jcGFOmmZWAFNwt03bq9/Ma0q
3jB0Dyz7IDGm8D6Y770wJRP3jf7iCVYt8jB49gOCAQUAAoIBACnVv+1ROrUiHAwn
xXGlsZdTEYZfWbE8Cter15JNNqh/Z1cdIp9m1t/rVF69nSWQvrvLeFo5p5mGxK8r
IKHTZTaAn6uO6PcNJc6iB7fS15L4uiB7p73MdjE+3PcYMbhttDlexdm6QxsmCP1F
3LYW3Uh879AURWZwPH3z4NZL2u1AFSyS1vQhtiCmztq94QwhjoDf9anFR8q05dAC
juPlKYEIhMsoq+r/l/kOM1UghhXX6BmeF8R9hhW1p4Rv+gyAgbYjowJFtZnwE5p0
OYLJzSQWjFMYEzHAoH8J4+D5okt4IXEd0BDxLBkm1WonIxYL/NL95p3qXpgUXqRX
M9spEzWgbTBrBgkqhkiG9w0BCQ4xXjBcMCcGA1UdEQQgMB6CC2V4YW1wbGUuY29t
gg93d3cuZXhhbXBsZS5jb20wDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCBaAw
EwYDVR0lBAwwCgYIKwYBBQUHAwEwCwYJYIZIAWUDBAMCA0AAMD0CHQCyrstoqfvs
MCfsZUeycKrKQmAJAHxuoGPCKl7yAhwhNH9RNxBm5roO2U901BeF2p0pT410ghH8
oA+F
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_DSA_2048 = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      DSA
  Length:         2048 bits
  Pub:            29:d5:bf:ed:51:3a:b5:22:1c:0c:27:c5:71:a5:b1:97:
                  53:11:86:5f:59:b1:3c:0a:d7:ab:d7:92:4d:36:a8:7f:
                  67:57:1d:22:9f:66:d6:df:eb:54:5e:bd:9d:25:90:be:
                  bb:cb:78:5a:39:a7:99:86:c4:af:2b:20:a1:d3:65:36:
                  80:9f:ab:8e:e8:f7:0d:25:ce:a2:07:b7:d2:d7:92:f8:
                  ba:20:7b:a7:bd:cc:76:31:3e:dc:f7:18:31:b8:6d:b4:
                  39:5e:c5:d9:ba:43:1b:26:08:fd:45:dc:b6:16:dd:48:
                  7c:ef:d0:14:45:66:70:3c:7d:f3:e0:d6:4b:da:ed:40:
                  15:2c:92:d6:f4:21:b6:20:a6:ce:da:bd:e1:0c:21:8e:
                  80:df:f5:a9:c5:47:ca:b4:e5:d0:02:8e:e3:e5:29:81:
                  08:84:cb:28:ab:ea:ff:97:f9:0e:33:55:20:86:15:d7:
                  e8:19:9e:17:c4:7d:86:15:b5:a7:84:6f:fa:0c:80:81:
                  b6:23:a3:02:45:b5:99:f0:13:9a:74:39:82:c9:cd:24:
                  16:8c:53:18:13:31:c0:a0:7f:09:e3:e0:f9:a2:4b:78:
                  21:71:1d:d0:10:f1:2c:19:26:d5:6a:27:23:16:0b:fc:
                  d2:fd:e6:9d:ea:5e:98:14:5e:a4:57:33:db:29:13:35
  P:              00:b2:fa:0a:98:21:dc:47:6c:bc:a9:0f:e4:a4:11:ce:
                  be:56:86:89:fa:bf:fc:5f:f4:ce:15:92:a5:f8:ef:c2:
                  a2:37:83:61:23:a9:72:fb:ac:26:32:bb:dc:31:a2:88:
                  0e:0e:8e:83:9d:e9:f1:7f:0d:71:a7:76:48:24:d0:ad:
                  7e:b4:89:ca:dd:00:b9:d8:ce:79:db:55:58:c4:a7:4e:
                  77:68:41:54:2d:61:22:34:9a:6a:c1:02:a1:4b:db:a8:
                  b5:6e:61:0c:c6:c7:7a:a7:3d:a7:53:7a:7c:c8:66:3f:
                  c2:96:22:5b:0c:b2:fb:f4:d9:bf:c6:b6:b7:9f:28:c2:
                  9c:3d:42:49:b8:71:7e:04:3e:8d:e2:87:f5:db:37:a7:
                  a8:a0:ec:7d:65:a1:2b:71:2f:66:83:75:2f:c1:00:e6:
                  d1:56:03:dd:98:d2:7a:ac:0f:ed:85:86:ca:1a:bb:80:
                  f2:6c:12:23:2b:7e:dd:76:d5:28:f2:37:3f:2b:92:15:
                  f3:a9:91:51:ba:38:e6:7d:34:f9:76:90:82:fd:9e:1d:
                  ef:f6:44:df:4b:5b:a8:76:8d:0c:cf:98:c0:1a:db:fd:
                  a2:fb:3e:7a:16:b3:ce:3b:56:98:c2:57:19:95:9a:02:
                  0f:a0:c1:e5:4d:b8:36:f5:1b:08:52:81:65:15:27:1a:
                  51
  Q:              00:c1:b0:c2:9c:e2:96:b4:5e:68:4a:9c:a1:7e:cf:63:
                  9b:b8:be:d5:74:e7:3b:a2:54:8a:a4:74:13
  G:              41:98:64:e6:a7:40:62:83:2f:66:13:e2:e5:33:a0:ca:
                  c4:f3:40:4d:45:78:01:2d:83:2a:71:64:8e:b9:4e:9c:
                  0e:fc:93:ab:01:7f:6f:61:9f:ea:09:85:ff:9d:c8:f8:
                  e7:9a:a2:3d:97:a7:97:9f:65:a3:f8:90:3f:38:49:52:
                  e6:ee:09:eb:cf:58:9d:dd:b0:a4:5b:03:22:ff:e4:d0:
                  b0:89:f9:df:60:13:09:1a:3d:14:14:62:f8:7a:45:55:
                  d1:e9:8b:2f:d1:f9:7a:a6:33:eb:8c:34:79:5d:92:a7:
                  8d:0e:f3:20:ae:d2:aa:fb:41:38:b7:ce:9a:b3:25:9e:
                  37:13:ed:ba:67:d6:e0:47:a7:35:96:68:0a:5b:64:0d:
                  ef:63:c7:c0:c9:53:96:ad:0e:ea:63:7e:7a:29:04:5a:
                  81:ab:d3:d2:56:a5:73:13:85:97:a6:00:ed:a6:1c:b0:
                  22:ab:a8:ee:d3:ec:dd:bb:35:99:ca:36:4f:64:0d:41:
                  e1:75:25:4e:00:ad:cc:7b:de:62:95:33:67:53:61:67:
                  23:3c:8d:c1:85:3a:69:99:58:01:4d:c2:dd:37:6e:af:
                  7f:31:ad:2a:de:30:74:0f:2c:fb:20:31:a6:f0:3e:98:
                  ef:bd:30:25:13:f7:8d:fe:e2:09:56:2d:f2:30:78:f6
Signature
  Algorithm:      SHA256withDSA
  Signature:
      R:          00:b2:ae:cb:68:a9:fb:ec:30:27:ec:65:47:b2:70:aa:
                  ca:42:60:09:00:7c:6e:a0:63:c2:2a:5e:f2
      S:          21:34:7f:51:37:10:66:e6:ba:0e:d9:4f:74:d4:17:85:
                  da:9d:29:4f:8d:74:82:11:fc:a0:0f:85
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl req -newkey rsa:4096 -keyout test-rsa-4096.key -out test-rsa-4096.csr
// -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com"
// -addext "subjectAltName = DNS:example.com,DNS:www.example.com,IP:127.0.0.1, \
// email:user@example.com,URI:http://example.com/api,otherName:1.2.3.4;UTF8:some value"
// -addext "basicConstraints = critical,CA:FALSE"
// -addext "keyUsage = critical,digitalSignature,keyEncipherment"
// -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_SAN = `-----BEGIN CERTIFICATE REQUEST-----
MIIFbTCCA1UCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCAiIwDQYJKoZIhvcNAQEB
BQADggIPADCCAgoCggIBAJf8uQDFcQfj6qCuPa4hNyDWr3Lwzfc3qQZdOgNJ/kym
GxxRHUXJyBtgkmAqDoSGmg1hUWgt9eZwd/Cf4Wd3qr+Q0ppg6dwZeWgYSunseoKl
f0E5FvUfECNyDwCSbltN9TCsom2ePNOOJJHWo4Y3E3jGXz0n1Vwa6ePR0j62Rcey
4lHLscQ3GoNvMLcXbY1HIhnbaI25MmFPB8p4PvpPsAYgbWHbw0jIR9dSxEK0HAU3
2VkRkm8XaF4BOEfugqT3Bc7zAvwdFZRTTTZIICYW5T3zvtxBidJ8OSej16LV6ZeE
/4VcTzXYTzIUXbNaev3XN1r5ZodkbZvxxk/EZmfes2OtedPulW4TW27HSl6XBos/
8VQohelUXiyCLPrtbnjeHKSz47+ZAm23jMAFYWkTVdWvAa+G74UstuRRXfLAKCNv
7VeA3l8IgEkfj48u+EenV6cJ3ZJJ5/qvZo7OUjhAtYJmNtlRYE4r3uWRmaNXYwrD
7vJuMiZafaVC+74/UHLGGm7sHVJdo4KBO/LUbHJ/SKZIYMc14kJLOf6TPZXSGm9N
TxbOV9Vzcjzivq1HxaYirLAM+nyVApVwwpVq/uiEFz579yrwySvBuwnewfdfZ6EZ
iNAKiBwQ8diFMnFfd/28hJ8TrIlq+5bkVo1ODuhyRIw9YB19IrmytaVvkR8624Ld
AgMBAAGggbUwgbIGCSqGSIb3DQEJDjGBpDCBoTBsBgNVHREEZTBjggtleGFtcGxl
LmNvbYIPd3d3LmV4YW1wbGUuY29thwR/AAABgRB1c2VyQGV4YW1wbGUuY29thhZo
dHRwOi8vZXhhbXBsZS5jb20vYXBpoBMGAyoDBKAMDApzb21lIHZhbHVlMAwGA1Ud
EwEB/wQCMAAwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA0G
CSqGSIb3DQEBCwUAA4ICAQAtOuh6MEralwgChJHBaGJavBxpCQ0p5K77RlAPIk5Q
Mv5086DxiZEFBKCRiZRtkOvo0aCHUn3awDrlEOgECiAYQqMIBUWeNwImtmpDopuI
ZMmVmzc2ojf9nUlPrPV+B6P2jTxTIQYpDQocbOgxDkcdZVSvLyMEFnHIMNQV7GS2
gBmUnPp+4z2d8X9XaRspkuEt2nbA1NoXekWaG46jG56VoBycepOiNkwL4AsqunLa
T0urcHq34g+HRQWwOA+q/72qP4oaj2ZO0fFJQl2ZsGRT/IuM1g2YsnVSpBOGY/J6
Qi2hDr6EEqphg501ny+FZE1BouQ/lSykafYyauwNq1puu/VyuF8grFmL0SoxWWfP
h6viblGM/Vu69Bhl4gkWKtufWpOVpCA4vHzes8IVMFg7vhpwm33Xjo0lCPcIUin6
0CqHZQCsWtj2yIAF66WHB0I1DHL5FNCWRPnQCo54qRZIYqtSP20QRr6GWC2d+ZgX
wDxRpmzr8T8owBYWw3j+RK9CtZoWO4O586UR4J1Bn5PQfoR78Z/4mzv2sxVi9Fdf
sJzlG6/nhmMaCqneIn97gkguvSgpOuKSeo/fjbpnthufgilrpDQoGrhZaXic0GVZ
6JmbOh3tLMVf4ooyyaLfOCfV2FN12rDa3pdWhQ4MVN4gg9U3Cq0x7yRQKiSBlBnw
oA==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_SAN = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      RSA
  Length:         4096 bits
  Modulus:        00:97:fc:b9:00:c5:71:07:e3:ea:a0:ae:3d:ae:21:37:
                  20:d6:af:72:f0:cd:f7:37:a9:06:5d:3a:03:49:fe:4c:
                  a6:1b:1c:51:1d:45:c9:c8:1b:60:92:60:2a:0e:84:86:
                  9a:0d:61:51:68:2d:f5:e6:70:77:f0:9f:e1:67:77:aa:
                  bf:90:d2:9a:60:e9:dc:19:79:68:18:4a:e9:ec:7a:82:
                  a5:7f:41:39:16:f5:1f:10:23:72:0f:00:92:6e:5b:4d:
                  f5:30:ac:a2:6d:9e:3c:d3:8e:24:91:d6:a3:86:37:13:
                  78:c6:5f:3d:27:d5:5c:1a:e9:e3:d1:d2:3e:b6:45:c7:
                  b2:e2:51:cb:b1:c4:37:1a:83:6f:30:b7:17:6d:8d:47:
                  22:19:db:68:8d:b9:32:61:4f:07:ca:78:3e:fa:4f:b0:
                  06:20:6d:61:db:c3:48:c8:47:d7:52:c4:42:b4:1c:05:
                  37:d9:59:11:92:6f:17:68:5e:01:38:47:ee:82:a4:f7:
                  05:ce:f3:02:fc:1d:15:94:53:4d:36:48:20:26:16:e5:
                  3d:f3:be:dc:41:89:d2:7c:39:27:a3:d7:a2:d5:e9:97:
                  84:ff:85:5c:4f:35:d8:4f:32:14:5d:b3:5a:7a:fd:d7:
                  37:5a:f9:66:87:64:6d:9b:f1:c6:4f:c4:66:67:de:b3:
                  63:ad:79:d3:ee:95:6e:13:5b:6e:c7:4a:5e:97:06:8b:
                  3f:f1:54:28:85:e9:54:5e:2c:82:2c:fa:ed:6e:78:de:
                  1c:a4:b3:e3:bf:99:02:6d:b7:8c:c0:05:61:69:13:55:
                  d5:af:01:af:86:ef:85:2c:b6:e4:51:5d:f2:c0:28:23:
                  6f:ed:57:80:de:5f:08:80:49:1f:8f:8f:2e:f8:47:a7:
                  57:a7:09:dd:92:49:e7:fa:af:66:8e:ce:52:38:40:b5:
                  82:66:36:d9:51:60:4e:2b:de:e5:91:99:a3:57:63:0a:
                  c3:ee:f2:6e:32:26:5a:7d:a5:42:fb:be:3f:50:72:c6:
                  1a:6e:ec:1d:52:5d:a3:82:81:3b:f2:d4:6c:72:7f:48:
                  a6:48:60:c7:35:e2:42:4b:39:fe:93:3d:95:d2:1a:6f:
                  4d:4f:16:ce:57:d5:73:72:3c:e2:be:ad:47:c5:a6:22:
                  ac:b0:0c:fa:7c:95:02:95:70:c2:95:6a:fe:e8:84:17:
                  3e:7b:f7:2a:f0:c9:2b:c1:bb:09:de:c1:f7:5f:67:a1:
                  19:88:d0:0a:88:1c:10:f1:d8:85:32:71:5f:77:fd:bc:
                  84:9f:13:ac:89:6a:fb:96:e4:56:8d:4e:0e:e8:72:44:
                  8c:3d:60:1d:7d:22:b9:b2:b5:a5:6f:91:1f:3a:db:82:
                  dd
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      SHA256withRSA
  Signature:      2d:3a:e8:7a:30:4a:da:97:08:02:84:91:c1:68:62:5a:
                  bc:1c:69:09:0d:29:e4:ae:fb:46:50:0f:22:4e:50:32:
                  fe:74:f3:a0:f1:89:91:05:04:a0:91:89:94:6d:90:eb:
                  e8:d1:a0:87:52:7d:da:c0:3a:e5:10:e8:04:0a:20:18:
                  42:a3:08:05:45:9e:37:02:26:b6:6a:43:a2:9b:88:64:
                  c9:95:9b:37:36:a2:37:fd:9d:49:4f:ac:f5:7e:07:a3:
                  f6:8d:3c:53:21:06:29:0d:0a:1c:6c:e8:31:0e:47:1d:
                  65:54:af:2f:23:04:16:71:c8:30:d4:15:ec:64:b6:80:
                  19:94:9c:fa:7e:e3:3d:9d:f1:7f:57:69:1b:29:92:e1:
                  2d:da:76:c0:d4:da:17:7a:45:9a:1b:8e:a3:1b:9e:95:
                  a0:1c:9c:7a:93:a2:36:4c:0b:e0:0b:2a:ba:72:da:4f:
                  4b:ab:70:7a:b7:e2:0f:87:45:05:b0:38:0f:aa:ff:bd:
                  aa:3f:8a:1a:8f:66:4e:d1:f1:49:42:5d:99:b0:64:53:
                  fc:8b:8c:d6:0d:98:b2:75:52:a4:13:86:63:f2:7a:42:
                  2d:a1:0e:be:84:12:aa:61:83:9d:35:9f:2f:85:64:4d:
                  41:a2:e4:3f:95:2c:a4:69:f6:32:6a:ec:0d:ab:5a:6e:
                  bb:f5:72:b8:5f:20:ac:59:8b:d1:2a:31:59:67:cf:87:
                  ab:e2:6e:51:8c:fd:5b:ba:f4:18:65:e2:09:16:2a:db:
                  9f:5a:93:95:a4:20:38:bc:7c:de:b3:c2:15:30:58:3b:
                  be:1a:70:9b:7d:d7:8e:8d:25:08:f7:08:52:29:fa:d0:
                  2a:87:65:00:ac:5a:d8:f6:c8:80:05:eb:a5:87:07:42:
                  35:0c:72:f9:14:d0:96:44:f9:d0:0a:8e:78:a9:16:48:
                  62:ab:52:3f:6d:10:46:be:86:58:2d:9d:f9:98:17:c0:
                  3c:51:a6:6c:eb:f1:3f:28:c0:16:16:c3:78:fe:44:af:
                  42:b5:9a:16:3b:83:b9:f3:a5:11:e0:9d:41:9f:93:d0:
                  7e:84:7b:f1:9f:f8:9b:3b:f6:b3:15:62:f4:57:5f:b0:
                  9c:e5:1b:af:e7:86:63:1a:0a:a9:de:22:7f:7b:82:48:
                  2e:bd:28:29:3a:e2:92:7a:8f:df:8d:ba:67:b6:1b:9f:
                  82:29:6b:a4:34:28:1a:b8:59:69:78:9c:d0:65:59:e8:
                  99:9b:3a:1d:ed:2c:c5:5f:e2:8a:32:c9:a2:df:38:27:
                  d5:d8:53:75:da:b0:da:de:97:56:85:0e:0c:54:de:20:
                  83:d5:37:0a:ad:31:ef:24:50:2a:24:81:94:19:f0:a0
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com
    IP: 127.0.0.1
    EMAIL: user@example.com
    URI: http://example.com/api
    Other: 1.2.3.4::some value`;

// openssl req -newkey rsa:2048 -keyout test-rsa-2048.key -out test-rsa-2048.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment," \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_KEY_USAGE = `-----BEGIN CERTIFICATE REQUEST-----
MIIDJDCCAgwCAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAKHQWxqtdJQ1l7ApTgwgsyrN/kRDrog/DsUlZQg3YodY
4RRAgPr+AeQ1BhuWDVxaXein0XmXOESHgK9Z7X/hLgRy2ifK+n20Ij3+k6VSh6Lt
lpjUPwK7PWBtZ969DukBIvq64XrJTNWIJPvXXQxkL4dk5NcDY4TjXWt0GgDVR+GH
OU1JwfzviGVRdOmY8+Ckfxc+3QytTdP6KBQaiUk5sBEniovDpKfImtql72JsCRbA
9Wue7X4EbXi2zvoAlJ5NXF3Ps1q2XsVJeIx/mMDcgRW7s5AVM9NQW0O1JLoA7dY+
vSrKZj+ssuKCIWM7u9Big2I0miEl5AXrDlwZPBhM9FMCAwEAAaBtMGsGCSqGSIb3
DQEJDjFeMFwwJwYDVR0RBCAwHoILZXhhbXBsZS5jb22CD3d3dy5leGFtcGxlLmNv
bTAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIB/jATBgNVHSUEDDAKBggrBgEF
BQcDATANBgkqhkiG9w0BAQsFAAOCAQEAPOr6jfq/mXilqXA11CTza69Ydd4fvp6q
UG47PefzQqSmYtpUytwZRLGQ1IFRlYeXwbazVLkRmLNwpbB8C5fh9FPp55JCpM/O
tgCW2uqLkCtkQMUCaSdRX/Y+9ypYhdBkSNv1Q+3QXi2jmi5QMqwerAwNmeXmH6AZ
swMgAhuoLS9OrIqHjFoHGoXsgXMkbLr6m6hgyFt8ZbbwK4WpVcgCZfhtBiLilCJN
Xr9GUXL3FqUb7sIaYKAaghr2haqKhFsIH57XVK3DZYhOkLd9uC8TLdl2e+t9Hcy9
ymLwiIGMUfuBQMP8nVu3jGXAQ5N4VV+IZfF8UaBFW8tG+Ms2TeW68Q==
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_KEY_USAGE = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      RSA
  Length:         2048 bits
  Modulus:        00:a1:d0:5b:1a:ad:74:94:35:97:b0:29:4e:0c:20:b3:
                  2a:cd:fe:44:43:ae:88:3f:0e:c5:25:65:08:37:62:87:
                  58:e1:14:40:80:fa:fe:01:e4:35:06:1b:96:0d:5c:5a:
                  5d:e8:a7:d1:79:97:38:44:87:80:af:59:ed:7f:e1:2e:
                  04:72:da:27:ca:fa:7d:b4:22:3d:fe:93:a5:52:87:a2:
                  ed:96:98:d4:3f:02:bb:3d:60:6d:67:de:bd:0e:e9:01:
                  22:fa:ba:e1:7a:c9:4c:d5:88:24:fb:d7:5d:0c:64:2f:
                  87:64:e4:d7:03:63:84:e3:5d:6b:74:1a:00:d5:47:e1:
                  87:39:4d:49:c1:fc:ef:88:65:51:74:e9:98:f3:e0:a4:
                  7f:17:3e:dd:0c:ad:4d:d3:fa:28:14:1a:89:49:39:b0:
                  11:27:8a:8b:c3:a4:a7:c8:9a:da:a5:ef:62:6c:09:16:
                  c0:f5:6b:9e:ed:7e:04:6d:78:b6:ce:fa:00:94:9e:4d:
                  5c:5d:cf:b3:5a:b6:5e:c5:49:78:8c:7f:98:c0:dc:81:
                  15:bb:b3:90:15:33:d3:50:5b:43:b5:24:ba:00:ed:d6:
                  3e:bd:2a:ca:66:3f:ac:b2:e2:82:21:63:3b:bb:d0:62:
                  83:62:34:9a:21:25:e4:05:eb:0e:5c:19:3c:18:4c:f4:
                  53
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      SHA256withRSA
  Signature:      3c:ea:fa:8d:fa:bf:99:78:a5:a9:70:35:d4:24:f3:6b:
                  af:58:75:de:1f:be:9e:aa:50:6e:3b:3d:e7:f3:42:a4:
                  a6:62:da:54:ca:dc:19:44:b1:90:d4:81:51:95:87:97:
                  c1:b6:b3:54:b9:11:98:b3:70:a5:b0:7c:0b:97:e1:f4:
                  53:e9:e7:92:42:a4:cf:ce:b6:00:96:da:ea:8b:90:2b:
                  64:40:c5:02:69:27:51:5f:f6:3e:f7:2a:58:85:d0:64:
                  48:db:f5:43:ed:d0:5e:2d:a3:9a:2e:50:32:ac:1e:ac:
                  0c:0d:99:e5:e6:1f:a0:19:b3:03:20:02:1b:a8:2d:2f:
                  4e:ac:8a:87:8c:5a:07:1a:85:ec:81:73:24:6c:ba:fa:
                  9b:a8:60:c8:5b:7c:65:b6:f0:2b:85:a9:55:c8:02:65:
                  f8:6d:06:22:e2:94:22:4d:5e:bf:46:51:72:f7:16:a5:
                  1b:ee:c2:1a:60:a0:1a:82:1a:f6:85:aa:8a:84:5b:08:
                  1f:9e:d7:54:ad:c3:65:88:4e:90:b7:7d:b8:2f:13:2d:
                  d9:76:7b:eb:7d:1d:cc:bd:ca:62:f0:88:81:8c:51:fb:
                  81:40:c3:fc:9d:5b:b7:8c:65:c0:43:93:78:55:5f:88:
                  65:f1:7c:51:a0:45:5b:cb:46:f8:cb:36:4d:e5:ba:f1
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Non-repudiation
    Key encipherment
    Data encipherment
    Key agreement
    Key certificate signing
    CRL signing
  Extended Key Usage:
    TLS Web Server Authentication
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

// openssl req -newkey rsa:2048 -keyout test-rsa-2048.key -out test-rsa-2048.csr \
//    -subj "/C=CH/ST=Zurich/L=Zurich/O=Example RE/OU=IT Department/CN=example.com" \
//    -addext "subjectAltName = DNS:example.com,DNS:www.example.com" \
//    -addext "basicConstraints = critical,CA:FALSE" \
//    -addext "keyUsage = critical,digitalSignature,keyEncipherment" \
//    -addext "extendedKeyUsage = serverAuth"
const IN_EXAMPLE_COM_EXTENDED_KEY_USAGE = `-----BEGIN CERTIFICATE REQUEST-----
MIIDpzCCAo8CAQAwcjELMAkGA1UEBhMCQ0gxDzANBgNVBAgMBlp1cmljaDEPMA0G
A1UEBwwGWnVyaWNoMRMwEQYDVQQKDApFeGFtcGxlIFJFMRYwFAYDVQQLDA1JVCBE
ZXBhcnRtZW50MRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAMjQ/Bz+CzA/WaS+Nyp3ijWzYlKY7GmA/a2FuzNSPQlr
WuGyZJcfb0CpLIpRF8qcDllAe+hFQnVGnk3svQIhfEOD7qwzBRMHVhe59jkv2kER
s+u88KBCNfIAS6m5d45y4xH338aXq4lZexiEASWHS7SsWAR3kL3c9p14U9EHOaym
ZWPO/SCfCJyhxszDLM2eG5S2rviuu9nY+rk0Oo7z8x8PZF9Wl1NamLl1tWPqsznS
3bfjdJYeUlm7XvTzC6EMAT6K/5ker0chl7Hg0mcEO9w4c2cSTAHvZ2b2sRYbxNQZ
49byQsRAXW8TNnOaK9Phmvwy/irEXU9PEl3u7KvSnNcCAwEAAaCB7zCB7AYJKoZI
hvcNAQkOMYHeMIHbMCcGA1UdEQQgMB6CC2V4YW1wbGUuY29tgg93d3cuZXhhbXBs
ZS5jb20wDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCBaAwgZEGA1UdJQSBiTCB
hgYIKwYBBQUHAwEGCCsGAQUFBwMCBggrBgEFBQcDAwYIKwYBBQUHAwQGCCsGAQUF
BwMIBgorBgEEAYI3AgEVBgorBgEEAYI3AgEWBgorBgEEAYI3CgMBBgorBgEEAYI3
CgMDBgorBgEEAYI3CgMEBgorBgEEAYI3FAICBgorBgEEAYI3CgMDMA0GCSqGSIb3
DQEBCwUAA4IBAQCcYWj1eIxj/FUEhhm2lZr06Pq4GEtIVsMWw5IrUn2FIFb/yY8x
GHuB5v7XNA/8zhRWvIAXGaa8Bnajk4mR0rkxy1MXpd2YevdrF/XFa2Totv4E4/I6
pvrFefYTSGpmCu5zQTuoanM7JjE81vvbTLFdaHMdLOekpuK5v5kbuNdtDpEiAkd0
vmV4BQ0BV3b3zhIRQqBB60pSBHYvMhHNn/80RhVUQxaPTS7/AMHRZGRc1lD9/bjA
pMBis9CL4AbXtTcztU5qy4VpB1/Ej3AbAjuJIbpbPH6XtxIEtqdM4Seqi44w9oX4
rxQagXmvJPp+E4253EkeHwhfHh4SnJEtsibQ
-----END CERTIFICATE REQUEST-----`;

const OUT_EXAMPLE_COM_EXTENDED_KEY_USAGE = `Subject
  C  = CH
  ST = Zurich
  L  = Zurich
  O  = Example RE
  OU = IT Department
  CN = example.com
Public Key
  Algorithm:      RSA
  Length:         2048 bits
  Modulus:        00:c8:d0:fc:1c:fe:0b:30:3f:59:a4:be:37:2a:77:8a:
                  35:b3:62:52:98:ec:69:80:fd:ad:85:bb:33:52:3d:09:
                  6b:5a:e1:b2:64:97:1f:6f:40:a9:2c:8a:51:17:ca:9c:
                  0e:59:40:7b:e8:45:42:75:46:9e:4d:ec:bd:02:21:7c:
                  43:83:ee:ac:33:05:13:07:56:17:b9:f6:39:2f:da:41:
                  11:b3:eb:bc:f0:a0:42:35:f2:00:4b:a9:b9:77:8e:72:
                  e3:11:f7:df:c6:97:ab:89:59:7b:18:84:01:25:87:4b:
                  b4:ac:58:04:77:90:bd:dc:f6:9d:78:53:d1:07:39:ac:
                  a6:65:63:ce:fd:20:9f:08:9c:a1:c6:cc:c3:2c:cd:9e:
                  1b:94:b6:ae:f8:ae:bb:d9:d8:fa:b9:34:3a:8e:f3:f3:
                  1f:0f:64:5f:56:97:53:5a:98:b9:75:b5:63:ea:b3:39:
                  d2:dd:b7:e3:74:96:1e:52:59:bb:5e:f4:f3:0b:a1:0c:
                  01:3e:8a:ff:99:1e:af:47:21:97:b1:e0:d2:67:04:3b:
                  dc:38:73:67:12:4c:01:ef:67:66:f6:b1:16:1b:c4:d4:
                  19:e3:d6:f2:42:c4:40:5d:6f:13:36:73:9a:2b:d3:e1:
                  9a:fc:32:fe:2a:c4:5d:4f:4f:12:5d:ee:ec:ab:d2:9c:
                  d7
  Exponent:       65537 (0x10001)
Signature
  Algorithm:      SHA256withRSA
  Signature:      9c:61:68:f5:78:8c:63:fc:55:04:86:19:b6:95:9a:f4:
                  e8:fa:b8:18:4b:48:56:c3:16:c3:92:2b:52:7d:85:20:
                  56:ff:c9:8f:31:18:7b:81:e6:fe:d7:34:0f:fc:ce:14:
                  56:bc:80:17:19:a6:bc:06:76:a3:93:89:91:d2:b9:31:
                  cb:53:17:a5:dd:98:7a:f7:6b:17:f5:c5:6b:64:e8:b6:
                  fe:04:e3:f2:3a:a6:fa:c5:79:f6:13:48:6a:66:0a:ee:
                  73:41:3b:a8:6a:73:3b:26:31:3c:d6:fb:db:4c:b1:5d:
                  68:73:1d:2c:e7:a4:a6:e2:b9:bf:99:1b:b8:d7:6d:0e:
                  91:22:02:47:74:be:65:78:05:0d:01:57:76:f7:ce:12:
                  11:42:a0:41:eb:4a:52:04:76:2f:32:11:cd:9f:ff:34:
                  46:15:54:43:16:8f:4d:2e:ff:00:c1:d1:64:64:5c:d6:
                  50:fd:fd:b8:c0:a4:c0:62:b3:d0:8b:e0:06:d7:b5:37:
                  33:b5:4e:6a:cb:85:69:07:5f:c4:8f:70:1b:02:3b:89:
                  21:ba:5b:3c:7e:97:b7:12:04:b6:a7:4c:e1:27:aa:8b:
                  8e:30:f6:85:f8:af:14:1a:81:79:af:24:fa:7e:13:8d:
                  b9:dc:49:1e:1f:08:5f:1e:1e:12:9c:91:2d:b2:26:d0
Requested Extensions
  Basic Constraints: critical
    CA = false
  Key Usage: critical
    Digital Signature
    Key encipherment
  Extended Key Usage:
    TLS Web Server Authentication
    TLS Web Client Authentication
    Code signing
    E-mail Protection (S/MIME)
    Trusted Timestamping
    Microsoft Individual Code Signing
    Microsoft Commercial Code Signing
    Microsoft Trust List Signing
    Microsoft Server Gated Crypto
    Microsoft Encrypted File System
    Microsoft Smartcard Login
    Microsoft Server Gated Crypto
  Subject Alternative Name:
    DNS: example.com
    DNS: www.example.com`;

TestRegister.addTests([
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with RSA 1024",
        input: IN_EXAMPLE_COM_RSA_1024,
        expectedOutput: OUT_EXAMPLE_COM_RSA_1024,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
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
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with EC 256",
        input: IN_EXAMPLE_COM_EC_P256,
        expectedOutput: OUT_EXAMPLE_COM_EC_P256,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with EC 384",
        input: IN_EXAMPLE_COM_EC_P384,
        expectedOutput: OUT_EXAMPLE_COM_EC_P384,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with EC 521",
        input: IN_EXAMPLE_COM_EC_P521,
        expectedOutput: OUT_EXAMPLE_COM_EC_P521,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with DSA 1024",
        input: IN_EXAMPLE_COM_DSA_1024,
        expectedOutput: OUT_EXAMPLE_COM_DSA_1024,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with DSA 2048",
        input: IN_EXAMPLE_COM_DSA_2048,
        expectedOutput: OUT_EXAMPLE_COM_DSA_2048,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with DSA 2048",
        input: IN_EXAMPLE_COM_DSA_2048,
        expectedOutput: OUT_EXAMPLE_COM_DSA_2048,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with various SAN types",
        input: IN_EXAMPLE_COM_SAN,
        expectedOutput: OUT_EXAMPLE_COM_SAN,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with various Key Usages",
        input: IN_EXAMPLE_COM_KEY_USAGE,
        expectedOutput: OUT_EXAMPLE_COM_KEY_USAGE,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse CSR: Example Certificate Signing Request (CSR) with various Extended Key Usages",
        input: IN_EXAMPLE_COM_EXTENDED_KEY_USAGE,
        expectedOutput: OUT_EXAMPLE_COM_EXTENDED_KEY_USAGE,
        recipeConfig: [
            {
                "op": "Parse CSR",
                "args": ["PEM"]
            }
        ]
    },
]);
