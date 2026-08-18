/**
 * PGP tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {ASCII_TEXT, UTF8_TEXT, ALL_BYTES} from "../../samples/Ciphers.mjs";

const rawStringToArrayBuffer = str => Uint8Array.from(str, c => c.charCodeAt(0)).buffer;

// RSA-1024
const ALICE_PRIVATE = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

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
Eq/5/Q==
=HBWf
-----END PGP PRIVATE KEY BLOCK-----`;

const ALICE_PUBLIC = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

xo0EahcezQEEAMHouiP41c1AGBU0IO0VjE2+O9WKc8Cpbv+ymy+MI6EOsiSoZ/Z+
hjqyMumx1loeH4K0QClzcWfeAtKrXs8JjQonByKtuneRjITNnasCEmWmqZbea5qa
p9+s6A6m+VHUehrtIvipNaq/Bfrynk9RwRMoAoTYJBUyPWaSLzzaV0zNABEBAAHN
AMK0BBMBCgAeBQJqFx7NAhsvAwsJBwMVCggCHgECF4ADFgIBAhkBAAoJEBt1IEsq
342M/VsEALQX4Lc7Udc9Obc5AnxABhzDZnCaFHYeZFJwyWtHpIN60gGFkz9vePji
0DP1Kbeyo6awzUIzA8tuIGgZXQCJ04KPCP8dSXH0HpbrmSinuJW5kk+ttvaJxOm1
3m9e52i2WkomCP6i8gvMXm/VpH5kfLkbpl0ha0ycR7z8yweD4Mdpzo0EahcezQEE
AKjU543TxZbzZiae6XWFIXjFgWE/vBC+5ZYEyTAG6jtwfP4tgagb+chJG+hoFA9H
ZXXPr5CPiNZUW6aPpbaMRmubIZs7uCpw3RfcZ+AR+Q9unf0kCJxXThRBhhWHipaL
B44MweCueUawRjwnJVog9nIEE1Heg5G9/fHemLZJ7iU/ABEBAAHCwIMEGAEKAA8F
AmoXHs0FCQ8JnAACGy4AqAkQG3UgSyrfjYydIAQZAQoABgUCahcezQAKCRA5/CQI
qiKa+krFA/9Tnl0E4Ck9zR6BYKAQFpShzBnpODx28LDn/yH+20e1vt2Hgb5cerfM
87PzIdLbavS5OYNtAVPtCc9a4WA3lQFggziOKVNt5UtsI9hNe8KfMAXpBEtXU53C
sRKkWzi+rBlSZ9/Oh4jqsUcj0cceJRn9La71h3Kot8cxNl72zyIHK4y2A/4jNAej
Mx0Rc0VSUWnHD9vlO/imzkez7+JKIYkMm8LrG1ZeLaSlTaQ0AIpbr2+3/kMuWhM0
dU4BHtmjjNU5ijq7/+ZBG+O2bO+vlYmDpOL6j+dkRpQgvsJdoLBt14mQbxBJfVTm
XvfhTUPZT4nCZN+5nUNAF2XsDatMic+Yjki7Ps6NBGoXHs0BBADEJr0pscgaUine
6UW2M0zQ57UybQphUYv4xYeZwOG1NvNLK6jcxQ9NGIlhUhJ/hV4piYy4A4bt7/Vy
O+CgSDWXf7kc8YL1tve9k9KIMceAT60Wt7QnHSSooysH5zRtE/Zqzc9luD9iWNGU
dKSAveJ5tJoPBJBB8cAsqWr8ZqP5qQARAQABwsCDBBgBCgAPBQJqFx7NBQkDwmcA
AhsuAKgJEBt1IEsq342MnSAEGQEKAAYFAmoXHs0ACgkQjWbXIJgXR6SYaQP+PjA9
SI4z/bbROkoNv73VCWM4o9r0DMASHK2Dyd71vOoOFjM/GtpGgQvjAKB82Db7+wsG
T6V6bxpvY1sMOxCjphsLs2u2IvZLHqlc/v8CCXLHoiN3v6PVwkYG17UyZoDbCVt3
0SCZ5jJ7gCf+MpC9RseIteW5MtbFtKb6FwGgi9GNQQQAr4PFi8aXZ71lmB7/c/8f
XAzsWRto9v64xtlZwpQ5GSOPvwzNjQfZf3Q4lKormkoqTxxC1tsxRxvbr51ZwfJU
8LCfKZz9p+M1ncX6nyJBJupmesqfrjWizzuEYqo8D4q0jaoWq6lEsUWLSBcJXKaA
kHFtNAeebzImsGV9hhKv+f0=
=IODM
-----END PGP PUBLIC KEY BLOCK-----`;

// ECC-384
const BOB_PRIVATE = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

xaQEahclbRMFK4EEACIDAwSvC1SlbUU7/QJFldLQGfAeyhu0mRvTIcxzANM9SdkI
dS2ArnVOZCB7cnfj5AF1nAjphKCv+01LAkGpCF6dUrvDwDeicMaq+E1OPVc+G0bH
O4qQwJgyRLV/GNUZ0ASSmNYAAYCxPV5eRqoX/13vQ38EFBDqWVQE5BuIvvFqNI2R
2RW7hAyI8AWazxDF90gurec8mWYXJM0AwpYEExMKAB4FAmoXJW0CGy8DCwkHAxUK
CAIeAQIXgAMWAgECGQEACgkQXd9oo/PqkifstAF+KMP1xACDyAqsoZjzmOdD03+r
qaHk3EDO7J98qA+g3laUj/bx21IM8FJNEJHKs9TpAYD8LpHAGHmDuBKZDCZKabIS
avxAOuoEHOOu9GlGk+8LgftPLW3EYUf/R7m4mGIq1UzHdwRqFyVtEwgqhkjOPQMB
BwIDBGf0GrkZYEH+SU15lkMjYcHndaqwYbF+JPgUVc6ZiQYDkaY2uodq+n82HoNr
zsCvKJxzC9upm8qzOwFHL+C7UvoAAP9MeWPmsuLSLXq+cVeqoEHAFQ/VYTBL/N7A
XeiiDdUbKBFmwsAnBBgTCgAPBQJqFyVtBQkPCZwAAhsCAGoJEF3faKPz6pInXyAE
GRMKAAYFAmoXJW0ACgkQVQZtQ9p5kJtfDQD+Ns1eh7rEAXveFSOLhx7Vw/5kUWm8
wVWbqWDK5tJTF5EA/2+3jIQfg+/pE+VkO/NuIGQ9bUqGmGuX0s14TcjqDm9LNugB
f27462A7iEkTab0nOQXtd6+L3PeHRUPUT1CFq+74M5GABr0wobJ5CCaQNxQH++IK
vwF+MSD0JajEVgi99qzSQOTZe8UGArddSCIJuUxNwEzaxvT6DombpLJ2O4yYklR/
xwoJx3sEahclbRIIKoZIzj0DAQcCAwRjn9T4UunA8a8ZuWP31AJheebCAcPFWBGx
dkxFeX65heVpMipOZ97EczRkitfAmiwt7cREq6yhvZ42KMOcZHPIAwEKCQABAFwA
UyvBBcchnSFCguG8EbEeA+DFKS62fvhqMHyMLGtfDUvChwQYEwoADwUCahclbQUJ
A8JnAAIbDAAKCRBd32ij8+qSJ1+sAX4wkp3GZiRAtUZujC3bJ0ukYJjieNHFapA6
r+0ku3mR/9OFDbVaTPEcL7nhgGY94q8BfRvczdClIK0rdY/bopQDq4uERoiB/bsH
1VFadIEvMZeIppWGb8d93IpZErGT9xQI8A==
=XC/n
-----END PGP PRIVATE KEY BLOCK-----`;

const BOB_PUBLIC = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

xm8EahclbRMFK4EEACIDAwSvC1SlbUU7/QJFldLQGfAeyhu0mRvTIcxzANM9SdkI
dS2ArnVOZCB7cnfj5AF1nAjphKCv+01LAkGpCF6dUrvDwDeicMaq+E1OPVc+G0bH
O4qQwJgyRLV/GNUZ0ASSmNbNAMKWBBMTCgAeBQJqFyVtAhsvAwsJBwMVCggCHgEC
F4ADFgIBAhkBAAoJEF3faKPz6pIn7LQBfijD9cQAg8gKrKGY85jnQ9N/q6mh5NxA
zuyffKgPoN5WlI/28dtSDPBSTRCRyrPU6QGA/C6RwBh5g7gSmQwmSmmyEmr8QDrq
BBzjrvRpRpPvC4H7Ty1txGFH/0e5uJhiKtVMzlIEahclbRMIKoZIzj0DAQcCAwRn
9Bq5GWBB/klNeZZDI2HB53WqsGGxfiT4FFXOmYkGA5GmNrqHavp/Nh6Da87Aryic
cwvbqZvKszsBRy/gu1L6wsAnBBgTCgAPBQJqFyVtBQkPCZwAAhsCAGoJEF3faKPz
6pInXyAEGRMKAAYFAmoXJW0ACgkQVQZtQ9p5kJtfDQD+Ns1eh7rEAXveFSOLhx7V
w/5kUWm8wVWbqWDK5tJTF5EA/2+3jIQfg+/pE+VkO/NuIGQ9bUqGmGuX0s14Tcjq
Dm9LNugBf27462A7iEkTab0nOQXtd6+L3PeHRUPUT1CFq+74M5GABr0wobJ5CCaQ
NxQH++IKvwF+MSD0JajEVgi99qzSQOTZe8UGArddSCIJuUxNwEzaxvT6DombpLJ2
O4yYklR/xwoJzlYEahclbRIIKoZIzj0DAQcCAwRjn9T4UunA8a8ZuWP31AJheebC
AcPFWBGxdkxFeX65heVpMipOZ97EczRkitfAmiwt7cREq6yhvZ42KMOcZHPIAwEK
CcKHBBgTCgAPBQJqFyVtBQkDwmcAAhsMAAoJEF3faKPz6pInX6wBfjCSncZmJEC1
Rm6MLdsnS6RgmOJ40cVqkDqv7SS7eZH/04UNtVpM8RwvueGAZj3irwF9G9zN0KUg
rSt1j9uilAOri4RGiIH9uwfVUVp0gS8xl4imlYZvx33cilkSsZP3FAjw
=BHOx
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
        input: rawStringToArrayBuffer(ALL_BYTES),
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
        input: rawStringToArrayBuffer(ALL_BYTES),
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
        name: "PGP Sign/Verify: RSA, All bytes",
        input: rawStringToArrayBuffer(ALL_BYTES),
        expectedMatch: /Signed by PGP key ID: 2ADF8D8C\nPGP fingerprint: 7afe93ff7614167c3fe831fe1b75204b2adf8d8c\nSigned on .*\n----------------------------------\n/,
        recipeConfig: [
            {
                "op": "PGP Sign",
                "args": [ALICE_PRIVATE, ""]
            },
            {
                "op": "PGP Verify",
                "args": [ALICE_PUBLIC]
            }
        ]
    },
    {
        name: "PGP Decrypt and Verify: UTF8, Alice -> Bob",
        input: `-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

wX4DEY2FMRPYAl0SAgMEKY2yuB8s16oRWWhJ1RsxNhR8byKFUyFZvi0ETIORMYu+
kkLWgFlVjqPV9q2eVtuVK9f+S/OIm0pztImhq5ZNMDB8r7s0wX4YskSrWRpMKwRr
CtoNlPS3//fT3Ll4a2tn8guxyC7lAtmJ6nxZj+qpSZLSwQwBhFlgARdqlp4eTAhF
PRcqHVCqZYSTdjAyerLtfZDaswEwLgGxsshRSJ7BDHxg7NqRcdFkChrWT0s4JpnV
/Woq0xcApim1bpyHXG/tT4oM3hbjfpulb92gq2TUNdzb9lJGaKbLHl/0zkoBvHDE
pxtr021JXERB8MNDIIpDESpjCrZ20YCHNr/sBqVm0yM7YGrDLlV+n7oUgL4HK2FU
tehxUEt4rca81UesYu/Wul6mHh/7Ft4jJuZuf/w9fCWQ6z+9MAEOBXdzWUp5BCyF
ce1STpICAdtRHInJ9zR08qn0ahrwHsvHPFPVIQJDargD5MSqav/3LS2TYqKYYKHy
TUCxIWqA77Qk3rEaFX+eHxTW4BTlMPArA7ffywkgJAPzrLL+gEgtOLCv2RhNZevR
weglQRtcuh5N/F9fsmPfsi80R0//LpEeyFX6GueXDw81+AKG9pOTI71Ny8H4W0eA
B5dCiOFNHZKCZUlA6GFa04X/XgmfPzTPMtgizbT72/2kfwxJGZY4ngdMVLqfhnVA
nfyQLFrOF9giJqDEsjtPXJ0h20stMLMykPUIK0UUf9vPthE86ugCY1XcGQWsuB4U
jmdH1dqEUk29TaUz/97s
=Ah/0
-----END PGP MESSAGE-----
`,
        expectedOutput: `Signed by PGP key ID: 2ADF8D8C
PGP fingerprint: 7afe93ff7614167c3fe831fe1b75204b2adf8d8c
Signed on Wed, 27 May 2026 17:18:20 GMT
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
        name: "PGP Decrypt: ASCII, Alice",
        input: `-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

wYwDOfwkCKoimvoBA/98ONH8b+HoaDOVLhtF+9Pz5Sk/NZ43htOpm/3+b2B81GKZ
fcUfJYzItyt4X5Ps1ksfrArokG6blkIHPwZdcF7TJ9rWy/cC9S3zP/LF893xT9Z7
buWj1BjqfNy15WtGJnnQeCJVI4ya0cb3G/I/zAF/mT6R/JcldbJ1OTz9Zy5pZtKi
AQL7B8IscCxsx9jxc1ZR3swn+fr603BVP6/mXRRtKIa5DXZR5uMU9ChZ5AYQeHXe
ZzstlcSJWJvuF+uJy3Yc07ttzqQtOQGLh0iBeALK7BWqLsUBqKabZSHTZ4uFdkv9
86ZebPsfjVlhz4oFYenBUq1C15Zpvut28pHpgh2TLuXPHKkmTwI2Zz9LvVRjBW7A
rmDPrpTfy9MOrkjkY7zQSevi
=/Zwh
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
        input: `-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.1.17
Comment: https://keybase.io/crypto

yMB1AnicO8LLzMDFaPlHhWOV0qxfjKcnljJkiTsIOiok5+fm5ucp5GYWlyRmpyqU
ZCSWKBSk5hfkpCrkggTKM1LzFEqKKjPz0hVK8hVSUosz0/MUivNzU0syQGJA/UC1
Jak5lQpp+fk5BUX5+WkKmcUgtaV5KalFqcUlmbmJJSCTUxWAGlLzSjNLKhWAimA6
wfqK9Q7NYWFg5GJgY2UCOYyBi1MA5tqzj1kYZqaFSuxmUvBnvvAzZOOuyT9vnT75
5GVzY2WfOB8H08l5vCZNbBUegsqPPh2aXPQgo8GglTPO2e7qY75g49mzDm+8POfH
nstrb2/93JHrXD5fbcbuVrsFJ01XWE2Xy7HtTgrasGG7ySLZqLStBj2r0n4dTX7g
MV1ETCdx6nqHA+4as4Oy9040BACRHYIP
=rkte
-----END PGP MESSAGE-----`,
        expectedOutput: `Signed by PGP key ID: 2ADF8D8C
PGP fingerprint: 7afe93ff7614167c3fe831fe1b75204b2adf8d8c
Signed on Wed, 27 May 2026 19:03:45 GMT
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
