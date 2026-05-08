/**
 * Parse X.509 CRL tests.
 *
 * @author robinsandhu
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const IN_CRL_PEM_RSA = `-----BEGIN X509 CRL-----
MIID7jCCAdYCAQEwDQYJKoZIhvcNAQELBQAwQjELMAkGA1UEBhMCVUsxDzANBgNV
BAgMBkxvbmRvbjELMAkGA1UECgwCQkIxFTATBgNVBAMMDFRlc3QgUm9vdCBDQRcN
MjQwODI1MTE0OTEwWhcNMjQwOTI0MTE0OTEwWjA1MDMCAhAAFw0yNDA4MjUwMzIz
MDhaMB4wCgYDVR0VBAMKAQYwEAYDVR0XBAkGByqGSM44AgOgggEnMIIBIzAJBgNV
HRIEAjAAMH0GA1UdIwR2MHSAFLjJrf2oUFTVhW40i0xgL7BJtodGoUakRDBCMQsw
CQYDVQQGEwJVSzEPMA0GA1UECAwGTG9uZG9uMQswCQYDVQQKDAJCQjEVMBMGA1UE
AwwMVGVzdCBSb290IENBghQ3XUv2vXwRfMxGGv/XLywm+B5LPTAtBgNVHS4EJjAk
MCKgIKAehhxodHRwOi8vZXhhbXBsZS5jb20vZGVsdGEtY3JsMFsGA1UdHwRUMFIw
IaAfoB2GG2h0dHA6Ly9leGFtcGxlLmNvbS9mdWxsLWNybDAhoB+gHYYbbGRhcDov
L2V4YW1wbGUuY29tL2Z1bGwtY3JsMAqgCKAGhwR/AAABMAsGA1UdFAQEAgIePDAN
BgkqhkiG9w0BAQsFAAOCAgEAAxsr+9nELUVWhFekwy6GsqH8xOf6EqGjRaEdX49W
mB40m2VajOkK8UHGoVyZzoDI2r/c8OPXUtbpK0fpvEl3SZU5j/C8JbZaZFFrEGeH
fSEqdVHFjohpawNcG41Qs+YT21TBqH1hD5yVI7gjVvfKICRfxDpl5oGClxBCVOSV
gVtLbe9q44uCBJ1kUkoc9Vz47Hv7JyckgqVXkORWHt2SFNALxlMEzOEQTpuC5Kcb
4i7hTCUF+kpkIvr02LJImq0Aaqzs6cC/DcdJiRPPyfaN8fQryFv76gg9i8zZcb6c
W42rvumiyw+7nnZfmq53webr5fCHaXhZk47ASOJD6GC5cX9rje1qGRgULXRhqcvK
n319s2iXj3FStDDorKGgsCV2zYmotX17ExB98CcCgBE52zMtRZilwhOGeh8mx3qT
l0W2B8uKKAq5BMmiziSBzQt700JPiruURZXbQ1fH1n7pKP6wGEh2e9TfQMlN20hE
I+CMt+1bG0Bpt5AfiwE8UykQ/WvpVxdJrgj0JM0yA37KfC8XD+cmavJ5/grorbj3
t0zBdK7bl+Y45VU/5/mX5ZR3O3ea1RclPM3hKMREfPneOlpan6r3dVwFqEN/TeTu
46vuDeKaEr3yJkOFfy0lSYPhPhzhU5vDR5ibxqvwxZNznI2AdTnZLEf8LRqnTVo1
qx0=
-----END X509 CRL-----`;

const OUT_CRL_PEM_RSA = `Certificate Revocation List (CRL):
    Version: 2 (0x1)
    Signature Algorithm: SHA256withRSA
    Issuer:
        C  = UK
        ST = London
        O  = BB
        CN = Test Root CA
    Last Update: Sun, 25 Aug 2024 11:49:10 GMT
    Next Update: Tue, 24 Sep 2024 11:49:10 GMT
	CRL extensions:
        2.5.29.46:
        	Unsupported CRL extension. Try openssl CLI.
        X509v3 Authority Key Identifier:
        	keyid:B8:C9:AD:FD:A8:50:54:D5:85:6E:34:8B:4C:60:2F:B0:49:B6:87:46
        	DirName:/C=UK/ST=London/O=BB/CN=Test Root CA
        	serial:37:5D:4B:F6:BD:7C:11:7C:CC:46:1A:FF:D7:2F:2C:26:F8:1E:4B:3D
        X509v3 CRL Distribution Points:
        	Full Name:
        		URI:http://example.com/full-crl
        	Full Name:
        		URI:ldap://example.com/full-crl
        	Full Name:
        		IP:127.0.0.1
        X509v3 CRL Number:
        	1E3C
        issuerAltName:
        	Unsupported CRL extension. Try openssl CLI.
Revoked Certificates:
    Serial Number: 1000
        Revocation Date: Sun, 25 Aug 2024 03:23:08 GMT
    	CRL entry extensions:
            X509v3 CRL Reason Code:
                Certificate Hold
            Hold Instruction Code:
            	Hold Instruction Reject
Signature Value:
        03:1b:2b:fb:d9:c4:2d:45:56:84:57:a4:c3:2e:86:b2:a1:fc:
        c4:e7:fa:12:a1:a3:45:a1:1d:5f:8f:56:98:1e:34:9b:65:5a:
        8c:e9:0a:f1:41:c6:a1:5c:99:ce:80:c8:da:bf:dc:f0:e3:d7:
        52:d6:e9:2b:47:e9:bc:49:77:49:95:39:8f:f0:bc:25:b6:5a:
        64:51:6b:10:67:87:7d:21:2a:75:51:c5:8e:88:69:6b:03:5c:
        1b:8d:50:b3:e6:13:db:54:c1:a8:7d:61:0f:9c:95:23:b8:23:
        56:f7:ca:20:24:5f:c4:3a:65:e6:81:82:97:10:42:54:e4:95:
        81:5b:4b:6d:ef:6a:e3:8b:82:04:9d:64:52:4a:1c:f5:5c:f8:
        ec:7b:fb:27:27:24:82:a5:57:90:e4:56:1e:dd:92:14:d0:0b:
        c6:53:04:cc:e1:10:4e:9b:82:e4:a7:1b:e2:2e:e1:4c:25:05:
        fa:4a:64:22:fa:f4:d8:b2:48:9a:ad:00:6a:ac:ec:e9:c0:bf:
        0d:c7:49:89:13:cf:c9:f6:8d:f1:f4:2b:c8:5b:fb:ea:08:3d:
        8b:cc:d9:71:be:9c:5b:8d:ab:be:e9:a2:cb:0f:bb:9e:76:5f:
        9a:ae:77:c1:e6:eb:e5:f0:87:69:78:59:93:8e:c0:48:e2:43:
        e8:60:b9:71:7f:6b:8d:ed:6a:19:18:14:2d:74:61:a9:cb:ca:
        9f:7d:7d:b3:68:97:8f:71:52:b4:30:e8:ac:a1:a0:b0:25:76:
        cd:89:a8:b5:7d:7b:13:10:7d:f0:27:02:80:11:39:db:33:2d:
        45:98:a5:c2:13:86:7a:1f:26:c7:7a:93:97:45:b6:07:cb:8a:
        28:0a:b9:04:c9:a2:ce:24:81:cd:0b:7b:d3:42:4f:8a:bb:94:
        45:95:db:43:57:c7:d6:7e:e9:28:fe:b0:18:48:76:7b:d4:df:
        40:c9:4d:db:48:44:23:e0:8c:b7:ed:5b:1b:40:69:b7:90:1f:
        8b:01:3c:53:29:10:fd:6b:e9:57:17:49:ae:08:f4:24:cd:32:
        03:7e:ca:7c:2f:17:0f:e7:26:6a:f2:79:fe:0a:e8:ad:b8:f7:
        b7:4c:c1:74:ae:db:97:e6:38:e5:55:3f:e7:f9:97:e5:94:77:
        3b:77:9a:d5:17:25:3c:cd:e1:28:c4:44:7c:f9:de:3a:5a:5a:
        9f:aa:f7:75:5c:05:a8:43:7f:4d:e4:ee:e3:ab:ee:0d:e2:9a:
        12:bd:f2:26:43:85:7f:2d:25:49:83:e1:3e:1c:e1:53:9b:c3:
        47:98:9b:c6:ab:f0:c5:93:73:9c:8d:80:75:39:d9:2c:47:fc:
        2d:1a:a7:4d:5a:35:ab:1d`;

const IN_CRL_PEM_RSA_CRL_REASON_AND_INVALIDITY_DATE = `-----BEGIN X509 CRL-----
MIID9jCCAd4CAQEwDQYJKoZIhvcNAQELBQAwQjELMAkGA1UEBhMCVUsxDzANBgNV
BAgMBkxvbmRvbjELMAkGA1UECgwCQkIxFTATBgNVBAMMDFRlc3QgUm9vdCBDQRcN
MjQwODI1MTIwODU2WhcNMjQwOTI0MTIwODU2WjA9MDsCAhAAFw0yNDA4MjUxMjA4
NDhaMCYwCgYDVR0VBAMKAQEwGAYDVR0YBBEYDzIwMjQwODI1MDAwMDAwWqCCAScw
ggEjMAkGA1UdEgQCMAAwfQYDVR0jBHYwdIAUuMmt/ahQVNWFbjSLTGAvsEm2h0ah
RqREMEIxCzAJBgNVBAYTAlVLMQ8wDQYDVQQIDAZMb25kb24xCzAJBgNVBAoMAkJC
MRUwEwYDVQQDDAxUZXN0IFJvb3QgQ0GCFDddS/a9fBF8zEYa/9cvLCb4Hks9MC0G
A1UdLgQmMCQwIqAgoB6GHGh0dHA6Ly9leGFtcGxlLmNvbS9kZWx0YS1jcmwwWwYD
VR0fBFQwUjAhoB+gHYYbaHR0cDovL2V4YW1wbGUuY29tL2Z1bGwtY3JsMCGgH6Ad
hhtsZGFwOi8vZXhhbXBsZS5jb20vZnVsbC1jcmwwCqAIoAaHBH8AAAEwCwYDVR0U
BAQCAh49MA0GCSqGSIb3DQEBCwUAA4ICAQByLp7JWQmB1NhlLACH6zFOe31yCTVy
xJQtgujtSri1LNu6IwzBGsKBQIl3ucwMxPvoZzlujNLmshUT3nSogV0/5n1q0Gyj
5Yiz2iw8mmKJLmGZ9Oz3QoGxgFww0/0x/VwRHuS2hw+A7JB8tO/2nW3oTclvS55l
R+VtkDjUN58+Yl2SQksvb3qD6bHHJTCaP7Dskls0fdBIoYIDvZejrTYSSzTX/Kw4
735P0GBMhj7zVF8azGz2PFpSISg4huJMyp7EDKZf2c2dnkuwmEUlPQEBLX25j/Il
81OxfVVFja+wUagaGtjEPGy5gsU8zFwkWhjaD5PGBbZvnT+EDsOtJPU7Ot/sBHfz
XqUtMrfmz/S/GsQ+QCpnBvarBy9QYuk9M0ePBGy33CUQpjPULxuJJVAHxNoetHCv
7udng2Pi4D8vDNfzbMwHt7HurMo0CsSju+cL4rnIfsz02RrD9WC84KxBLWkqC7Hi
IKGIpF740Yc4BliVE1HDaOKyI6FEft5asj3OgXwmBw7pVlxSNWACaA2vOFkdN/V5
XZZjVJdRJxkgEfCvsJVenFp8ND6gmJmWum7tqM5ytmiXjPtejsPpVq4IclG+Yhnr
tFQ9TDEuCrNsRIGGGDodyXq1+kGXY0w8RqGEb7J4Og/M6r4LMAKPkO7e0nEibTqX
d2igvR2e5p+yKw==
-----END X509 CRL-----`;

const OUT_CRL_PEM_RSA_CRL_REASON_AND_INVALIDITY_DATE = `Certificate Revocation List (CRL):
    Version: 2 (0x1)
    Signature Algorithm: SHA256withRSA
    Issuer:
        C  = UK
        ST = London
        O  = BB
        CN = Test Root CA
    Last Update: Sun, 25 Aug 2024 12:08:56 GMT
    Next Update: Tue, 24 Sep 2024 12:08:56 GMT
	CRL extensions:
        2.5.29.46:
        	Unsupported CRL extension. Try openssl CLI.
        X509v3 Authority Key Identifier:
        	keyid:B8:C9:AD:FD:A8:50:54:D5:85:6E:34:8B:4C:60:2F:B0:49:B6:87:46
        	DirName:/C=UK/ST=London/O=BB/CN=Test Root CA
        	serial:37:5D:4B:F6:BD:7C:11:7C:CC:46:1A:FF:D7:2F:2C:26:F8:1E:4B:3D
        X509v3 CRL Distribution Points:
        	Full Name:
        		URI:http://example.com/full-crl
        	Full Name:
        		URI:ldap://example.com/full-crl
        	Full Name:
        		IP:127.0.0.1
        X509v3 CRL Number:
        	1E3D
        issuerAltName:
        	Unsupported CRL extension. Try openssl CLI.
Revoked Certificates:
    Serial Number: 1000
        Revocation Date: Sun, 25 Aug 2024 12:08:48 GMT
    	CRL entry extensions:
            X509v3 CRL Reason Code:
                Key Compromise
            Invalidity Date:
            	Sun, 25 Aug 2024 00:00:00 GMT
Signature Value:
        72:2e:9e:c9:59:09:81:d4:d8:65:2c:00:87:eb:31:4e:7b:7d:
        72:09:35:72:c4:94:2d:82:e8:ed:4a:b8:b5:2c:db:ba:23:0c:
        c1:1a:c2:81:40:89:77:b9:cc:0c:c4:fb:e8:67:39:6e:8c:d2:
        e6:b2:15:13:de:74:a8:81:5d:3f:e6:7d:6a:d0:6c:a3:e5:88:
        b3:da:2c:3c:9a:62:89:2e:61:99:f4:ec:f7:42:81:b1:80:5c:
        30:d3:fd:31:fd:5c:11:1e:e4:b6:87:0f:80:ec:90:7c:b4:ef:
        f6:9d:6d:e8:4d:c9:6f:4b:9e:65:47:e5:6d:90:38:d4:37:9f:
        3e:62:5d:92:42:4b:2f:6f:7a:83:e9:b1:c7:25:30:9a:3f:b0:
        ec:92:5b:34:7d:d0:48:a1:82:03:bd:97:a3:ad:36:12:4b:34:
        d7:fc:ac:38:ef:7e:4f:d0:60:4c:86:3e:f3:54:5f:1a:cc:6c:
        f6:3c:5a:52:21:28:38:86:e2:4c:ca:9e:c4:0c:a6:5f:d9:cd:
        9d:9e:4b:b0:98:45:25:3d:01:01:2d:7d:b9:8f:f2:25:f3:53:
        b1:7d:55:45:8d:af:b0:51:a8:1a:1a:d8:c4:3c:6c:b9:82:c5:
        3c:cc:5c:24:5a:18:da:0f:93:c6:05:b6:6f:9d:3f:84:0e:c3:
        ad:24:f5:3b:3a:df:ec:04:77:f3:5e:a5:2d:32:b7:e6:cf:f4:
        bf:1a:c4:3e:40:2a:67:06:f6:ab:07:2f:50:62:e9:3d:33:47:
        8f:04:6c:b7:dc:25:10:a6:33:d4:2f:1b:89:25:50:07:c4:da:
        1e:b4:70:af:ee:e7:67:83:63:e2:e0:3f:2f:0c:d7:f3:6c:cc:
        07:b7:b1:ee:ac:ca:34:0a:c4:a3:bb:e7:0b:e2:b9:c8:7e:cc:
        f4:d9:1a:c3:f5:60:bc:e0:ac:41:2d:69:2a:0b:b1:e2:20:a1:
        88:a4:5e:f8:d1:87:38:06:58:95:13:51:c3:68:e2:b2:23:a1:
        44:7e:de:5a:b2:3d:ce:81:7c:26:07:0e:e9:56:5c:52:35:60:
        02:68:0d:af:38:59:1d:37:f5:79:5d:96:63:54:97:51:27:19:
        20:11:f0:af:b0:95:5e:9c:5a:7c:34:3e:a0:98:99:96:ba:6e:
        ed:a8:ce:72:b6:68:97:8c:fb:5e:8e:c3:e9:56:ae:08:72:51:
        be:62:19:eb:b4:54:3d:4c:31:2e:0a:b3:6c:44:81:86:18:3a:
        1d:c9:7a:b5:fa:41:97:63:4c:3c:46:a1:84:6f:b2:78:3a:0f:
        cc:ea:be:0b:30:02:8f:90:ee:de:d2:71:22:6d:3a:97:77:68:
        a0:bd:1d:9e:e6:9f:b2:2b`;

const IN_CRL_PEM_RSA_CRL_EXTENSIONS = `-----BEGIN X509 CRL-----
MIIE0DCCArgCAQEwDQYJKoZIhvcNAQELBQAwQjELMAkGA1UEBhMCVUsxDzANBgNV
BAgMBkxvbmRvbjELMAkGA1UECgwCQkIxFTATBgNVBAMMDFRlc3QgUm9vdCBDQRcN
MjQwODI1MTIzNzEwWhcNMjQwOTI0MTIzNzEwWjA9MDsCAhAAFw0yNDA4MjUxMjA4
NDhaMCYwCgYDVR0VBAMKAQEwGAYDVR0YBBEYDzIwMjQwODI1MDAwMDAwWqCCAgEw
ggH9MIHiBgNVHRIEgdowgdegFAYEKgMEBaAMFgpDdXN0b21OYW1lgQ5jYUBleGFt
cGxlLmNvbYYSaHR0cDovL2V4YW1wbGUuY29tgg5jYS5leGFtcGxlLmNvbYcEwKgB
AaSBhDCBgTELMAkGA1UEBhMCVVMxFTATBgNVBAgMDEV4YW1wbGVTdGF0ZTEUMBIG
A1UEBwwLRXhhbXBsZUNpdHkxEzARBgNVBAoMCkV4YW1wbGVPcmcxFDASBgNVBAsM
C0V4YW1wbGVVbml0MRowGAYDVQQDDBFFeGFtcGxlQ29tbW9uTmFtZTB9BgNVHSME
djB0gBS4ya39qFBU1YVuNItMYC+wSbaHRqFGpEQwQjELMAkGA1UEBhMCVUsxDzAN
BgNVBAgMBkxvbmRvbjELMAkGA1UECgwCQkIxFTATBgNVBAMMDFRlc3QgUm9vdCBD
QYIUN11L9r18EXzMRhr/1y8sJvgeSz0wLQYDVR0uBCYwJDAioCCgHoYcaHR0cDov
L2V4YW1wbGUuY29tL2RlbHRhLWNybDBbBgNVHR8EVDBSMCGgH6AdhhtodHRwOi8v
ZXhhbXBsZS5jb20vZnVsbC1jcmwwIaAfoB2GG2xkYXA6Ly9leGFtcGxlLmNvbS9m
dWxsLWNybDAKoAigBocEfwAAATALBgNVHRQEBAICHkIwDQYJKoZIhvcNAQELBQAD
ggIBAF/9L4aGmId2igw7+MfDxokevIJkJX/MkmHpXBl1b4hL85FGD7OPCmn47VzC
Wejlc/AQB7mWyUugvrVEq/FiCO8a8Fieyjw5uCYz0eiNnuvHVRGM2mOEkiA0I/rn
F5AFB1YfCFGXPyRkXNRbOBE91mhOzh1H9PX2qVnj5l3KsPE/7YuteacR0TkfkRJa
BXLic+5F/CCV/J/iYR7LncuLUlhBfsosG/ucHL70EytlfX6CBWY3kBbmj7nd497T
QG392+m9xp7MIsJAS+3qEzwJAfni6zUV0fWh/ucOl8BIjHEh97VqI3+8yzhdXfkF
2gkfpkqJQY0+5OO1VSRYTlQNld3QjN/VVJjatfHyaXfPCx4VEKW1kWYo+0zxO4SL
SB/+S/o99bCeNy1MXqEvy5HoDwFHePXGsAEPHWPdj7EWm7g9T/Fl1iSR6hpohvDD
K4LaGdVhzvCraLIh8H7XW3KztvZvDQejYQAgADW0UO0rFHJ1XXhKYSqXNGnfDt+3
cRpt2XxSxt5HJtHlatiI25PuBMNWV2Zod4RHB/8UEvs1KC7dcwkAiCEY+E3o/zkC
rdZ/8XtNf5a4WSN/D7pPsfsO6SE+7lxkJ+UQcZLXAz8b5ArPTlWt2HdJIBEVs25K
FAkizyldhnAcNHFk7XN94eTLNeD6hUbFL9pNHiSmKu5A9YW0
-----END X509 CRL-----`;

const OUT_CRL_PEM_RSA_CRL_EXTENSIONS = `Certificate Revocation List (CRL):
    Version: 2 (0x1)
    Signature Algorithm: SHA256withRSA
    Issuer:
        C  = UK
        ST = London
        O  = BB
        CN = Test Root CA
    Last Update: Sun, 25 Aug 2024 12:37:10 GMT
    Next Update: Tue, 24 Sep 2024 12:37:10 GMT
	CRL extensions:
        2.5.29.46:
        	Unsupported CRL extension. Try openssl CLI.
        X509v3 Authority Key Identifier:
        	keyid:B8:C9:AD:FD:A8:50:54:D5:85:6E:34:8B:4C:60:2F:B0:49:B6:87:46
        	DirName:/C=UK/ST=London/O=BB/CN=Test Root CA
        	serial:37:5D:4B:F6:BD:7C:11:7C:CC:46:1A:FF:D7:2F:2C:26:F8:1E:4B:3D
        X509v3 CRL Distribution Points:
            Full Name:
                URI:http://example.com/full-crl
            Full Name:
                URI:ldap://example.com/full-crl
            Full Name:
                IP:127.0.0.1
        X509v3 CRL Number:
        	1E42
        X509v3 Issuer Alternative Name:
            OtherName:1.2.3.4.5::CustomName
            EMAIL:ca@example.com
            URI:http://example.com
            DNS:ca.example.com
            IP:192.168.1.1
            DIR:/C=US/ST=ExampleState/L=ExampleCity/O=ExampleOrg/OU=ExampleUnit/CN=ExampleCommonName
Revoked Certificates:
    Serial Number: 1000
        Revocation Date: Sun, 25 Aug 2024 12:08:48 GMT
    	CRL entry extensions:
            X509v3 CRL Reason Code:
                Key Compromise
            Invalidity Date:
            	Sun, 25 Aug 2024 00:00:00 GMT
Signature Value:
        5f:fd:2f:86:86:98:87:76:8a:0c:3b:f8:c7:c3:c6:89:1e:bc:
        82:64:25:7f:cc:92:61:e9:5c:19:75:6f:88:4b:f3:91:46:0f:
        b3:8f:0a:69:f8:ed:5c:c2:59:e8:e5:73:f0:10:07:b9:96:c9:
        4b:a0:be:b5:44:ab:f1:62:08:ef:1a:f0:58:9e:ca:3c:39:b8:
        26:33:d1:e8:8d:9e:eb:c7:55:11:8c:da:63:84:92:20:34:23:
        fa:e7:17:90:05:07:56:1f:08:51:97:3f:24:64:5c:d4:5b:38:
        11:3d:d6:68:4e:ce:1d:47:f4:f5:f6:a9:59:e3:e6:5d:ca:b0:
        f1:3f:ed:8b:ad:79:a7:11:d1:39:1f:91:12:5a:05:72:e2:73:
        ee:45:fc:20:95:fc:9f:e2:61:1e:cb:9d:cb:8b:52:58:41:7e:
        ca:2c:1b:fb:9c:1c:be:f4:13:2b:65:7d:7e:82:05:66:37:90:
        16:e6:8f:b9:dd:e3:de:d3:40:6d:fd:db:e9:bd:c6:9e:cc:22:
        c2:40:4b:ed:ea:13:3c:09:01:f9:e2:eb:35:15:d1:f5:a1:fe:
        e7:0e:97:c0:48:8c:71:21:f7:b5:6a:23:7f:bc:cb:38:5d:5d:
        f9:05:da:09:1f:a6:4a:89:41:8d:3e:e4:e3:b5:55:24:58:4e:
        54:0d:95:dd:d0:8c:df:d5:54:98:da:b5:f1:f2:69:77:cf:0b:
        1e:15:10:a5:b5:91:66:28:fb:4c:f1:3b:84:8b:48:1f:fe:4b:
        fa:3d:f5:b0:9e:37:2d:4c:5e:a1:2f:cb:91:e8:0f:01:47:78:
        f5:c6:b0:01:0f:1d:63:dd:8f:b1:16:9b:b8:3d:4f:f1:65:d6:
        24:91:ea:1a:68:86:f0:c3:2b:82:da:19:d5:61:ce:f0:ab:68:
        b2:21:f0:7e:d7:5b:72:b3:b6:f6:6f:0d:07:a3:61:00:20:00:
        35:b4:50:ed:2b:14:72:75:5d:78:4a:61:2a:97:34:69:df:0e:
        df:b7:71:1a:6d:d9:7c:52:c6:de:47:26:d1:e5:6a:d8:88:db:
        93:ee:04:c3:56:57:66:68:77:84:47:07:ff:14:12:fb:35:28:
        2e:dd:73:09:00:88:21:18:f8:4d:e8:ff:39:02:ad:d6:7f:f1:
        7b:4d:7f:96:b8:59:23:7f:0f:ba:4f:b1:fb:0e:e9:21:3e:ee:
        5c:64:27:e5:10:71:92:d7:03:3f:1b:e4:0a:cf:4e:55:ad:d8:
        77:49:20:11:15:b3:6e:4a:14:09:22:cf:29:5d:86:70:1c:34:
        71:64:ed:73:7d:e1:e4:cb:35:e0:fa:85:46:c5:2f:da:4d:1e:
        24:a6:2a:ee:40:f5:85:b4`;


TestRegister.addTests([
    {
        name: "Parse X.509 CRL: Example PEM encoded CRL with RSA signature",
        input: IN_CRL_PEM_RSA,
        expectedOutput: OUT_CRL_PEM_RSA,
        recipeConfig: [
            {
                "op": "Parse X.509 CRL",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse X.509 CRL: Example PEM encoded CRL with RSA signature, CRL Reason and Invalidity Date",
        input: IN_CRL_PEM_RSA_CRL_REASON_AND_INVALIDITY_DATE,
        expectedOutput: OUT_CRL_PEM_RSA_CRL_REASON_AND_INVALIDITY_DATE,
        recipeConfig: [
            {
                "op": "Parse X.509 CRL",
                "args": ["PEM"]
            }
        ]
    },
    {
        name: "Parse X.509 CRL: Example PEM encoded CRL with RSA signature and CRL Extensions",
        input: IN_CRL_PEM_RSA_CRL_EXTENSIONS,
        expectedOutput: OUT_CRL_PEM_RSA_CRL_EXTENSIONS,
        recipeConfig: [
            {
                "op": "Parse X.509 CRL",
                "args": ["PEM"]
            }
        ]
    },
]);
