/**
 * ParseX509Certificate tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// SM2 test certificate (GM/T 0003 / GB/T 32918 curve), generated with:
//   openssl ecparam -name SM2 -genkey -noout -out key.pem
//   openssl req -new -x509 -key key.pem -subj "/CN=SM2 Test Certificate"
const SM2_CERT_HEX = "3082019330820139a00302010202144f8536bd6edbf8ce859eb1e4faa731c46e9924a2300a06082a811ccf55018375301f311d301b06035504030c14534d322054657374204365727469666963617465301e170d3236313031313136343831335a170d3336313030383136343831335a301f311d301b06035504030c14534d3220546573742043657274696669636174653059301306072a8648ce3d020106082a811ccf5501822d03420004cef3961360b4d1558a38e8431a11627e1003fcee5d13ad204b7e4ecb35499c0b4bf32b9396568d91b8bc119284f4720d074d057674888dabf43a6c931db69975a3533051301d0603551d0e04160414c5d91539340b44fd6a625e799d5969242e639c5f301f0603551d23041830168014c5d91539340b44fd6a625e799d5969242e639c5f300f0603551d130101ff040530030101ff300a06082a811ccf550183750348003045022005c5697ac6d549501924590484b122d48ace3fb82964e1181f0063cedcd38995022100fbc78077851a5832f2042d37f20d8823f7a79cb14aae8aaa78a6213c84c288e1";

TestRegister.addTests([
    {
        name: "Parse X.509 certificate: SM2 certificate (DER Hex)",
        input: SM2_CERT_HEX,
        expectedOutput: "Version:          3 (0x02)\nSerial number:    453981038530652797351227542635986856893811860642 (0x4f8536bd6edbf8ce859eb1e4faa731c46e9924a2)\nAlgorithm ID:     1.2.156.10197.1.501\nValidity\n  Not Before:     11/10/2026 16:48:13 (dd-mm-yyyy hh:mm:ss) (261011164813Z)\n  Not After:      08/10/2036 16:48:13 (dd-mm-yyyy hh:mm:ss) (361008164813Z)\nIssuer\n  CN = SM2 Test Certificate\nSubject\n  CN = SM2 Test Certificate\nFingerprints\n  MD5:            04ea92f4279a854b93dff8c32600a284\n  SHA1:           475e456806ac2a4a961672403ec9acf996f21508\n  SHA256:         0422b9f2b5525837056f907cb490bf7b78c75480fd689cbc1061e1d6bc5ea649\nPublic Key\n  Algorithm:      EC\n  Curve Name:     sm2p256v1\n  Length:         256 bits\n  pub:            04:ce:f3:96:13:60:b4:d1:55:8a:38:e8:43:1a:11:62:\n                  7e:10:03:fc:ee:5d:13:ad:20:4b:7e:4e:cb:35:49:9c:\n                  0b:4b:f3:2b:93:96:56:8d:91:b8:bc:11:92:84:f4:72:\n                  0d:07:4d:05:76:74:88:8d:ab:f4:3a:6c:93:1d:b6:99:\n                  75\nCertificate Signature\n  Algorithm:      1.2.156.10197.1.501\n  r:              05:c5:69:7a:c6:d5:49:50:19:24:59:04:84:b1:22:d4:\n                  8a:ce:3f:b8:29:64:e1:18:1f:00:63:ce:dc:d3:89:95\n  s:              00:fb:c7:80:77:85:1a:58:32:f2:04:2d:37:f2:0d:88:\n                  23:f7:a7:9c:b1:4a:ae:8a:aa:78:a6:21:3c:84:c2:88:\n                  e1\n\nExtensions\n  subjectKeyIdentifier :\n    c5d91539340b44fd6a625e799d5969242e639c5f\n  authorityKeyIdentifier :\n    kid=c5d91539340b44fd6a625e799d5969242e639c5f\n  basicConstraints CRITICAL:\n    cA=true\n",
        recipeConfig: [
            {
                op: "Parse X.509 certificate",
                args: ["DER Hex"],
            },
        ],
    },
]);
