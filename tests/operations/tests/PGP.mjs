/**
 * PGP tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {ASCII_TEXT, UTF8_TEXT, ALL_BYTES} from "../../samples/Ciphers.mjs";

// RSA-1024
const ALICE_PRIVATE = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

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
W03Cwfs=
=Mb52
-----END PGP PRIVATE KEY BLOCK-----`;

const ALICE_PUBLIC = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

xo0EWw1piwEEAL2ueaNPMssEJ7LaCr26f5dc/Tz2w/cA42FKK90mUkQRaO3332iD
y8zXxNwSTWzHIi2n8YuUT9PvQ08UC91VcojQoNBn1+bvskMqK2XnzuelFqyk45cv
XJRUUZWvhgQ8MugBPg8mDAjdOwQF8sZ45moGp3+y3D8UqOs1kktFh+OdABEBAAHN
AMK0BBMBCgAeBQJbDWmLAhsvAwsJBwMVCggCHgECF4ADFgIBAhkBAAoJEIQkZUjf
mOSF4+UD/AmZ7Nc5VpO0t+w4b8XtytxGFYHn3PhA1rI98b5aPkFCkDAJgDRTZ6mM
7fvpr3FYbxs8p/sGtuOHyW98RmAIvhuGGuaVkG10swFYY7Xh8i3I0ulWf8ncQxgm
St+xnDGLP/MeJMHVPgPP20ISfp0VRCY5INDnKB/ayb9JAfopXAuyzo0EWw1piwEE
AOXOJib0QIvuqKAZiN3Yol3xC9Wz5aXQyg7qCnnYHHrPIMgYvGrTjjvDFCwM5uxC
v38Qd6rJnzrRXTC1EiAia/b7f76Z0r4W+j6KdVCGpQnVQE6b//WdY5ys1xLAkNr4
xwNj42nrOIMGB1qV0XezJ4VBOMpMHlwE2WR27HOQakXDABEBAAHCwIMEGAEKAA8F
AlsNaYsFCQ8JnAACGy4AqAkQhCRlSN+Y5IWdIAQZAQoABgUCWw1piwAKCRA+2VNA
UiMLOuO9BACHIaNnbMMzHJcDegSgPdF+M9C0BgU8nmLT+Kv8UPadfv/9zJ3zMlLb
g/pL34gPy8HSf4nAXoqu+Oqkyd5dds+aLk55uoyiAtqFaaEK2OuIMqt8kmIvQeZM
oaXz2nZnn14GgtubgmmTWsvsSaiJuyZRl0FS61/S3Dki6xd38Hmw3CF2BACsHPId
UgXI3596BMT1xHrvsz3Y2NiGpjxz58X8BX7tdC/RWyL0H/8d5MwKaXqPK3F1IhkG
Xu4utqwg53QUmT5U/tSs58NrPqhWr61qtK0B6V+pP0NFBfD6cR16zhvEOw++LU6J
5O17ElE7XzXN2yY66S/ZGGCsnMUJynMCRRgaqM6NBFsNaYsBBACwyhti+jTYU12d
zCSS1bRDw+uXPSpk/A2oCVwqdHJd20G3LPsy5rH2MJyCjUzsZ4cQBEfuXuo5luCu
7Gy2Ofd6zoqg111/DkdvLfPCBo5SK1XftrevpmuXnEoLMlagQxRU6QM4PkBVnZNl
RDpQOczXwnV/eKS1DIzwwB0rGX67nwARAQABwsCDBBgBCgAPBQJbDWmLBQkDwmcA
AhsuAKgJEIQkZUjfmOSFnSAEGQEKAAYFAlsNaYsACgkQW/Z2teklb4u5/gP/fnZ7
ZuV+l4c2EQY5Xnk8S/lY3Xr9zoucjQwQWeRKwAQYoiovzxA4XV8gGyrdAsrIPUFL
p7PmUBG4YJV/7sVozzRwVq+jS8Jo0xYbGJMv2DuAnXXrYCZWZRqRscr1Wlc+CUAC
mxYZjC1DVVrAXr0jTqYTk+jjhemTTAtUelgMhcX82wP9EEU66hCYFUayjn4bBlR1
yEvMpJd8JSTHR/dZH8t3Ri6R2AYRqBxro0JEXDhL9iDnuPQVxsbgq2YlhHrPJI8o
pKuxV7wrXrupzwFfKixJMNwsAPk/nSc4qIZvXTi2fmyAZDJYUgsm6CwkxumaVvId
VNGRmxqGSRTuEIntW03Cwfs=
=PuGL
-----END PGP PUBLIC KEY BLOCK-----`;

// ECC-384
const BOB_PRIVATE = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

xcAABFsNafYBAYDHiv+tCi4267xI6iTmBrhOKdNbKLWIYMG1OoE1f9qpT+nAVKFR
zUAFXKqQjqMDESkAEQEAAQABewd7cLkIQHGKly8PE+P0h7fV7X5bJqwZiqDwC8DU
38vCUO/KtkZO3jEQYA1U9DsNDQDA73KCr3K1tSX1afeWzb8vVBY4ZzXocKb9AMDV
Vk17t1N4nClMfqpGIDELtYBMiiCDyJ0AwLsnQb9cE+g1MZETtNDYXXxilkO/4CP9
8j4HzQDCZAQTAQoAHgUCWw1p9gIbLwMLCQcDFQoIAh4BAheAAxYCAQIZAQAKCRCE
cIHWt/IPg+sqAYC6goCyOCYD/DytOW3I2cb12iDyFOSDsOx6lrmIgLyP0dDnbJHb
S9ar68yuHeDqP7jHiARbDWn2AQEAwSE4qpbLQzSIUfwmfWXmHneAuQIkEYawRxK/
H1JkGxcAEQEAAQAA/0pvbnK5OdBGMABBSehs3LrW/hWWIL0y/MfS7h/6gSJ5AID3
YOgHLqEgM1Bo2TzvIjwlAIDH3E+0ynQFdLH96FPp47eLAH9e/NZ74e2N8sTMBoYO
1sbcLp7CkwQYAQoADwUCWw1p9gUJDwmcAAIbLgBICRCEcIHWt/IPgz0gBBkBCgAG
BQJbDWn2AAoJELU8cYHhYcru2lwBAL4OUK2fkhzh2VU3meXgAMWjoP6ryRUCTmSQ
xuULvvCyfZMBfiHzV5QLgXSUVUA7Og6mlH5pw2gtgsZhijwwywkzF3tQ+s++hOZR
161wHxQKgwHIU8eIBFsNafYBAQCjOV/I3a0HkXVtLndCrWFcjmLzim9PX8EpYUV3
yG2/AQARAQABAAD8DBWPVduzl7/ZJcAu7CzR7F376NxG8J42+ioX12n9cNEAgNj7
qAcnQCtTDlb1waf4mdcAgMCTCuwur8AqIOSjoOzqwucAf1MfeKXhwNAEtoiD7S44
f8UvxsKTBBgBCgAPBQJbDWn2BQkDwmcAAhsuAEgJEIRwgda38g+DPSAEGQEKAAYF
AlsNafYACgkQNBtaoVz6VrvTVAD+LD063VrU7vlJ7xQwtMun4G3FW+RKgb7Rsww8
B1mt68F5dQGAm8ctxECzEMmyO8jSkjOLkG6u8zLQWFm9MBZqcdmt6EUDf1dA/3xu
/y59qEGb0j4w
=I/Gz
-----END PGP PRIVATE KEY BLOCK-----`;

const BOB_PUBLIC = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

xj0EWw1p9gEBgMeK/60KLjbrvEjqJOYGuE4p01sotYhgwbU6gTV/2qlP6cBUoVHN
QAVcqpCOowMRKQARAQABzQDCZAQTAQoAHgUCWw1p9gIbLwMLCQcDFQoIAh4BAheA
AxYCAQIZAQAKCRCEcIHWt/IPg+sqAYC6goCyOCYD/DytOW3I2cb12iDyFOSDsOx6
lrmIgLyP0dDnbJHbS9ar68yuHeDqP7jOLQRbDWn2AQEAwSE4qpbLQzSIUfwmfWXm
HneAuQIkEYawRxK/H1JkGxcAEQEAAcKTBBgBCgAPBQJbDWn2BQkPCZwAAhsuAEgJ
EIRwgda38g+DPSAEGQEKAAYFAlsNafYACgkQtTxxgeFhyu7aXAEAvg5QrZ+SHOHZ
VTeZ5eAAxaOg/qvJFQJOZJDG5Qu+8LJ9kwF+IfNXlAuBdJRVQDs6DqaUfmnDaC2C
xmGKPDDLCTMXe1D6z76E5lHXrXAfFAqDAchTzi0EWw1p9gEBAKM5X8jdrQeRdW0u
d0KtYVyOYvOKb09fwSlhRXfIbb8BABEBAAHCkwQYAQoADwUCWw1p9gUJA8JnAAIb
LgBICRCEcIHWt/IPgz0gBBkBCgAGBQJbDWn2AAoJEDQbWqFc+la701QA/iw9Ot1a
1O75Se8UMLTLp+BtxVvkSoG+0bMMPAdZrevBeXUBgJvHLcRAsxDJsjvI0pIzi5Bu
rvMy0FhZvTAWanHZrehFA39XQP98bv8ufahBm9I+MA==
=K9ht
-----END PGP PUBLIC KEY BLOCK-----`;

TestRegister.addTests([
    {
        name: "PGP Encrypt/Decrypt: RSA, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "PGP Encrypt",
                "args": [ALICE_PUBLIC]
            },
            {
                "op": "PGP Decrypt",
                "args": [ALICE_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Encrypt/Decrypt: RSA, All bytes",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                "op": "PGP Encrypt",
                "args": [ALICE_PUBLIC]
            },
            {
                "op": "PGP Decrypt",
                "args": [ALICE_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Encrypt/Decrypt: ECC, nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "PGP Encrypt",
                "args": [BOB_PUBLIC]
            },
            {
                "op": "PGP Decrypt",
                "args": [BOB_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Encrypt/Decrypt: ECC, All bytes",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                "op": "PGP Encrypt",
                "args": [BOB_PUBLIC]
            },
            {
                "op": "PGP Decrypt",
                "args": [BOB_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Decrypt and Verify: UTF8, Alice -> Bob",
        input: `-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

wTwDhHCB1rfyD4MBAX9ld8xGcf2v+X+pwINN0R0TvkWxNesKOQIKPV01AH8JG0J+
+yFqLXqDHgYSLANNamfSwQoBOTWuh/5V6gpiXVm2oLHPv997AtoD/kVQrqylF5Xo
HUsqPGtSgBA5WPX8tMoHKuqWxEy9FviLnIv73OZN0Ph70uo2E+QIv0Qx27znK0Jy
KDSERvcldgShmVbDP3Pxtxkfr9xa2gar5f0OPovOmKGsTGciQJqPkclRwzIXg12L
hyd2ElYOMf6vg/yOc06sX4Ih1Tn6JkYqMVJydykMv3g4Z8OXTfwrMLxwO1n3ZB/T
OLdhBdsnREnyCqntBVjMKoRTQhfwq48n7b6caZ+aCPISdDIyDKBpxEzXaNBeEY2V
GCqORM9WhsQ4A6pAx2SP694qH5vgOwrYrgeOU17oK++mzd1GyU2CXoFi73/PANJD
TdC3hGr+S4XeuqZ368QG1cBWhNybsOu5sM2YbArb71ZMYuLDp+VolJbEkVf4c/dD
pVEOaX39NVKe6HcpOiw+CFO6GEkQqCXNprWK6ivBHzkAlF2pjjqlS6qhWxFPicSD
+1ZKM1fmZu99bhTmdqE3MJx//QMu7mvlHaM85OQkWhWPBxGw/60GVBX9YtvUtfMS
IOE1W/Zqmqzq+4frwnzWwYv9/U1RwIs/qlFVnzliREOzW+om8EncSSd7fQ==
=fEAT
-----END PGP MESSAGE-----
`,
        expectedOutput: `Signed by PGP key ID: DF98E485
PGP fingerprint: e94e06dd0b3744a0e970de9d84246548df98e485
Signed on Tue, 29 May 2018 15:44:52 GMT
----------------------------------
${UTF8_TEXT}`,
        recipeConfig: [
            {
                "op": "PGP Decrypt and Verify",
                "args": [ALICE_PUBLIC, BOB_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Decrypt: ASCII, Alice -> Bob",
        input: `-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.0.77
Comment: https://keybase.io/crypto

wYwDPtlTQFIjCzoBBACSlbN7tmQVxR5ZD0rvCwXUkxO3RU8WgBkkmrTCUs9a+xrS
F9HuKcpX/N6XrwTXyuX3BN2tGys4zd6nHV8jYqBoIyWJsWe3viTa1dh/x4183+GP
fP61gizi3pj0gi2vfGnMhnThbdiO32PVKAeHLHBK+r3XlXZ0kzZCQKRgd55yr9Kk
Aa4SR+qpvtdobkDzbnbhcPLR6CQ8TMjTiNXEpgTc1i0JcP8jaMVFzBt8qgmDMdqU
H2qMY1O7hezH3fp+EZzCAccJMtK7VPk13WAgMRH22HirG4aK1i75IVOtjBgObzDh
8zKua7QLi6wJD/AtQ+D3/NgVpzoXwdoLvTjEcAyy+YWNWkJF/jvx3XV1Q/Fz7sHJ
/bspORYvbi591S4U0m4pikwiOZk=
=AVb/
-----END PGP MESSAGE-----`,
        expectedOutput: ASCII_TEXT,
        recipeConfig: [
            {
                "op": "PGP Decrypt",
                "args": [ALICE_PRIVATE, ""]
            }
        ]
    },
    {
        name: "PGP Verify: ASCII, Alice",
        input: `-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools.
-----BEGIN PGP SIGNATURE-----

iLMEAQEIAB0WIQRLbJy6MLpYOr9qojE+2VNAUiMLOgUCXRTsvwAKCRA+2VNAUiML
OuaHBADMMNtsuN92Fb+UrDimsv6TDQpbJhDkwp9kZdKYP5HAmSYAhXBG7N+YCMw+
v2FSpUu9jJiPBm1K1SEwLufQVexoRv6RsBNolRFB07sArau0s0DnIXUchCZWvyTP
1KsjBnDr84U2b11H58g4DlTT4gQrz30rFuHz9AGmPAtDHbSXIA==
=vnk/
-----END PGP SIGNATURE-----`,
        expectedOutput: `Signed by PGP key ID: DF98E485
PGP fingerprint: e94e06dd0b3744a0e970de9d84246548df98e485
Signed on Thu, 27 Jun 2019 16:20:15 GMT
----------------------------------
A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools.`,
        recipeConfig: [
            {
                "op": "PGP Verify",
                "args": [ALICE_PUBLIC]
            }
        ]
    }
]);
