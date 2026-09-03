/**
 * JWT Verify tests
 *
 * @author gchq77703 []
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const outputObject = JSON.stringify({
    String: "SomeString",
    Number: 42,
    iat: 1
}, null, 4);

const hsKey = "secret_cat";
/* Retaining private key as a comment
const rsPriv = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDlhnQq4PFKzMOV
qM1FyJkLv2oadstOD+3jxzokG2n48HdE7rSnBR1bbu4peSjvMK4Pg++qwwi/Q2V5
J/o97utd92P7+Qa/pz7JXZnNU6xKo7snYF3oKZXt63B75ia7/Gz7P5fC+KoBNlIu
4dFTdb0Mp/Ld8QvXuOrqMZBUbsYpxW/4FY0hWhimCXsItHogX41X7/AaXVLL/5fO
3o2yi78S3kbimqBAk6BQHFUQwl2Ktf432pWG7o6PvcMZHu5XKvphUYNItOc7KGuY
Qf83AYWfwttWO7pVw9wIQLsNQOg4dF2exNWOguZiJl5ri0E1sHOwm/3uZWGZc41G
qVNz6BfXAgMBAAECggEABTXLy0a3PiXEcXrsdfS7bKXYCGkWl7C1i2HJXb/K5F4T
sa/iz+vGIn4zz83dR64I4CH0PcxsQBM36XZ72ri4BQu0QahXJotAWfJ9pvM1n610
dndcilmZ+qrz2bbRaEZZnvZu69EYjYB91cHwg37SX3LXM4Hg7UZYUXVLO8TBS3oR
2spOUdC+jWZlK/irnu9SVqCYxPJ4GlTCVEtw81arbhVtVmSzYxoEJJWPRHLEOPK8
vwPDjzOzuQeDtHWuEriDsXe1iiVZA+06QfiI3YL60kdZqCNQeAr4AyXEZ4KHDuPZ
XKO8WE7zIJR/KOdFmQnMSjyVSgI9ZSNROr/n8FphYQKBgQD9k9gb5gzUL6UhRjpg
JnQxENGfZX2IE2ftqIlRqgquiv+haEmSuK9uFOksBPmuHL12xD6E29HWZ5eRZinw
j1MTSPn9YSBMSId3ZCx7fMWulI9GkD14ERCrwPTasqj0q2+qbLavf6DEkvAYgGs1
j5hBexw3Cs0MsAupK8uel9GapwKBgQDnt8liEU2MXiM0lZdA4JNv52UWVawLSTjZ
SnPD9Uvfs7e9qFAsQLHoBKTRKxjRNOduUCFjC0LDKK6V+D1Ykhw0iO2/v7v79F13
WlJm+11Wrw0LxRSVF8TJ7WSeV3NQoeneiInDY/SkVAJKuananAuxQa5vbVdjL9Yw
f2VNkPKvUQKBgDQPeWvo5DNgAMf/EhcRbgNwz4ipHoekbE7nriGdBoplMSxjK8+6
qRGxq1mFP/mWHvPWQHuoYcFiDUUls3CXDFhGQETb/vSKY32IjHVh3XgFOhEjpesT
ndeVSu/nhDaPR+K2ZR9M1aXmAPMW0mvxqjGvY9CNICH9trcpralGxBq7AoGBALtl
BedaiPWxGBWpuOYN+Q6x+y2h4X5LHD+Wl6LtmQv0Iu+t1BDFzVsPjl9e1DY068lp
4mZgMAD2wKKmXK5pk4flCSlenV+5E3G3yRZhyO2Wqh1PqEKfM1X+t7XakXavSxze
HVO4XZwcGLJoDnauZkJXFQQmUFr1z+nuzXV6eNnRAoGAYIpPHO5B6UtCPdK8p3jk
WYA790gGN/t6vMRw7qtFGBKt3DmlcTp7GHZxbF5p6yGKFPIo/mHGebdibTF4qamP
Rkqrshupx/m+4udn6kDNyi1mHJeWjoLod6qA8BaJIh2NqEcim6FQp6MfYVC84m91
KedDUWDtk6YFQKGxIDOrz/k=
-----END PRIVATE KEY-----`;
*/
const rsPub = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5YZ0KuDxSszDlajNRciZ
C79qGnbLTg/t48c6JBtp+PB3RO60pwUdW27uKXko7zCuD4PvqsMIv0NleSf6Pe7r
Xfdj+/kGv6c+yV2ZzVOsSqO7J2Bd6CmV7etwe+Ymu/xs+z+XwviqATZSLuHRU3W9
DKfy3fEL17jq6jGQVG7GKcVv+BWNIVoYpgl7CLR6IF+NV+/wGl1Sy/+Xzt6Nsou/
Et5G4pqgQJOgUBxVEMJdirX+N9qVhu6Oj73DGR7uVyr6YVGDSLTnOyhrmEH/NwGF
n8LbVju6VcPcCEC7DUDoOHRdnsTVjoLmYiZea4tBNbBzsJv97mVhmXONRqlTc+gX
1wIDAQAB
-----END PUBLIC KEY-----`;
// Same public key as rsPub, in PKCS#1 format
const rsPubPkcs1 = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5YZ0KuDxSszDlajNRciZC79qGnbLTg/t48c6JBtp+PB3RO60pwUd
W27uKXko7zCuD4PvqsMIv0NleSf6Pe7rXfdj+/kGv6c+yV2ZzVOsSqO7J2Bd6CmV
7etwe+Ymu/xs+z+XwviqATZSLuHRU3W9DKfy3fEL17jq6jGQVG7GKcVv+BWNIVoY
pgl7CLR6IF+NV+/wGl1Sy/+Xzt6Nsou/Et5G4pqgQJOgUBxVEMJdirX+N9qVhu6O
j73DGR7uVyr6YVGDSLTnOyhrmEH/NwGFn8LbVju6VcPcCEC7DUDoOHRdnsTVjoLm
YiZea4tBNbBzsJv97mVhmXONRqlTc+gX1wIDAQAB
-----END RSA PUBLIC KEY-----`;
// 1024-bit key: jose refuses RSA keys below 2048 bits
const rsPubWeak = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd
UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs
HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D
o2kQ+X5xK9cipRgEKwIDAQAB
-----END PUBLIC KEY-----`;
/* Retaining private key as a comment
const esPriv = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
-----END PRIVATE KEY-----`;
*/
const esPub = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEVs/o5+uQbTjL3chynL4wXgUg2R9
q9UU8I5mEovUf86QZ7kOBIjJwqnzD1omageEHWwHdBO6B+dFabmdT9POxg==
-----END PUBLIC KEY-----`;

const hsToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.0ha6-j4FwvEIKPVZ-hf3S_R9Hy_UtXzq4dnedXcUrXk";
const rsToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.GbJLourP2hTpBMm0mPrDOKSjsOnVU_teH0h7CCW333uT-56axQLR8pKcLyTBYt8wx5cZVk4lunqA95GCmz8upGN9U_Hzc6aCBaoXzbb9i0TGp-7kLOUP_UN0_5f96SWDHF4hb2P38Q1ONXMbI7hTbkphc4RlDpqSjNeFvzMgJpNjAVeIpzLoyhDqJbx_D6-iGQCXdHRgEpF8xNjZHHVADv00G0riIQvRsvJ3Q4XUiQDbtXCHfOWMIUWobLEFfI9I4se0RMRditm5UytOyrAuUl4QhskU3bofD8p7UiM9BjBHmTMepCJM__D1qrWjv5ugcYV7yVgerBKAoYF2LSAS2A";
// Same claims as rsToken, signed with the 1024-bit key pair
const rsTokenWeak = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.MjEJhtZk2nXzigi24piMzANmrj3mILHJcDl0xOjl5a8EgdKVL1oaMEjTkMQp5RA8YrqeRBFaX-BGGCKOXn5zPY1DJwWsBUyN9C-wGR2Qye0eogH_3b4M9EW00TPCUPXm2rx8URFj7Wg9VlsmrGzLV2oKkPgkVxuFSxnpO3yjn1Y";
const esToken = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.WkECT51jSfpRkcpQ4x0h5Dwe7CFBI6u6Et2gWp91HC7mpN_qCFadRpsvJLtKubm6cJTLa68xtei0YrDD8fxIUA";
// Same claims as hsToken plus "exp": 1, signed with hsKey
const hsTokenExpired = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxLCJleHAiOjF9.ZKrXhOiSg4rsEY77HurSJY1i4-cpFYkr6m_TTA2ChFM";
// Unsigned token: header {"alg":"none"}
const noneToken = "eyJhbGciOiJub25lIn0.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.";

TestRegister.addTests([
    {
        name: "JWT Verify: HS",
        input: hsToken,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [hsKey],
            }
        ],
    },
    {
        name: "JWT Verify: RS",
        input: rsToken,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [rsPub],
            }
        ],
    },
    {
        name: "JWT Verify: RS with PKCS#1 public key",
        input: rsToken,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [rsPubPkcs1],
            }
        ],
    },
    {
        name: "JWT Verify: RS with key shorter than 2048 bits",
        input: rsTokenWeak,
        expectedOutput: "TypeError: RS256 requires key modulusLength to be 2048 bits or larger",
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [rsPubWeak],
            }
        ],
    },
    {
        name: "JWT Verify: ES",
        input: esToken,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [esPub],
            }
        ],
    },
    {
        name: "JWT Verify: wrong key",
        input: hsToken,
        expectedOutput: "Invalid signature. Have you entered the correct key?",
        recipeConfig: [
            {
                op: "JWT Verify",
                args: ["wrong_secret"],
            }
        ],
    },
    {
        name: "JWT Verify: expired token",
        input: hsTokenExpired,
        expectedOutput: `The token has expired.

"exp" claim timestamp check failed`,
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [hsKey],
            }
        ],
    },
    {
        name: "JWT Verify: unsigned token",
        input: noneToken,
        expectedOutput: "This token is unsigned (\"alg\": \"none\") and cannot be verified. Use the 'JWT Decode' operation to view its payload.",
        recipeConfig: [
            {
                op: "JWT Verify",
                args: [hsKey],
            }
        ],
    }
]);
