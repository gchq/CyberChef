/**
 * Payment operation tests.
 *
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const ecdhPrivateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgVPecKErSPjan5fSz
f+jsKPKthv3Ao5N0IxkbatQNw16hRANCAARhg779GdYIpH0QnY66FmGX1nMFyybu
sjExdXFN15BBa1+zh1Cf7Cr484KJ8Mh2ga/Qs8qKk/8VbWSj0SbLb6Os
-----END PRIVATE KEY-----`;

const ecdhPrivateKeySec1 = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIFT3nChK0j42p+X0s3/o7CjyrYb9wKOTdCMZG2rUDcNeoAoGCCqGSM49
AwEHoUQDQgAEYYO+/RnWCKR9EJ2OuhZhl9ZzBcsm7rIxMXVxTdeQQWtfs4dQn+wq
+POCifDIdoGv0LPKipP/FW1ko9Emy2+jrA==
-----END EC PRIVATE KEY-----`;

const ecdhPeerPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZWOfvFUyA5ITdtEUar7aAz308Llr
pPVK74bCKbeq3gIA5ZN0we6T18GSkTHtCCOG266YyCGTcE2JrnswYk1f8A==
-----END PUBLIC KEY-----`;

TestRegister.addTests([
    {
        name: "Parse TR-31 key block: fixed header only",
        input: "D0016D0AB00E0000",
        expectedOutput: JSON.stringify({
            raw: "D0016D0AB00E0000",
            fixedHeader: {
                raw: "D0016D0AB00E0000",
                versionId: "D",
                declaredBlockLength: 16,
                keyUsage: "D0",
                algorithm: "A",
                modeOfUse: "B",
                keyVersionNumber: "00",
                exportability: "E",
                optionalBlocksDeclared: 0,
                reserved: "00"
            },
            optionalBlocks: [],
            bodyOffset: 16,
            remainingBody: "",
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse TR-31 key block",
                args: [true]
            }
        ]
    },
    {
        name: "Parse TR-34 B9 envelope: split sections",
        input: "001730303030423930303100112233300030303034AABBCCDD",
        expectedOutput: JSON.stringify({
            declaredLength: 23,
            actualLengthExcludingLengthField: 23,
            header: "0000",
            responseType: "B9",
            errorCode: "00",
            authDataHex: "3100",
            kcvHex: "112233",
            envelopeDataHex: "3000",
            signatureLengthAscii: "0004",
            signatureLength: 4,
            signatureHex: "AABBCCDD",
            trailingHex: ""
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse TR-34 B9 envelope",
                args: []
            }
        ]
    },
    {
        name: "Calculate Payment KCV: HMAC SHA-256",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "E8A065",
        recipeConfig: [
            {
                op: "Calculate Payment KCV",
                args: ["Hex", "HMAC SHA-256", 6]
            }
        ]
    },
    {
        name: "Calculate Payment KCV: AES-CMAC empty",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "917737",
        recipeConfig: [
            {
                op: "Calculate Payment KCV",
                args: ["Hex", "AES-CMAC (Empty)", 6]
            }
        ]
    },
    {
        name: "Calculate Payment KCV: AES-CMAC zeros",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "53E107",
        recipeConfig: [
            {
                op: "Calculate Payment KCV",
                args: ["Hex", "AES-CMAC (Zeros)", 6]
            }
        ]
    },
    {
        name: "Calculate Payment KCV: AES-CMAC ones",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "7B3046",
        recipeConfig: [
            {
                op: "Calculate Payment KCV",
                args: ["Hex", "AES-CMAC (Ones)", 6]
            }
        ]
    },
    {
        name: "Calculate Payment KCV: AES-ECB zeros",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "FDE4FB",
        recipeConfig: [
            {
                op: "Calculate Payment KCV",
                args: ["Hex", "AES-ECB (Zeros)", 6]
            }
        ]
    },
    {
        name: "Derive DUKPT Key: known IPEK vector",
        input: "0123456789ABCDEFFEDCBA9876543210",
        expectedOutput: "6AC292FAA1315B4D858AB3A3D7D5933A",
        recipeConfig: [
            {
                op: "Derive DUKPT Key",
                args: ["Derive IPEK", "FFFF9876543210E00008", "None", false]
            }
        ]
    },
    {
        name: "Build PIN Block: ISO Format 0",
        input: "1234",
        expectedOutput: "041215FEDCBA9876",
        recipeConfig: [
            {
                op: "Build PIN Block",
                args: ["ISO Format 0", "5432101234567890", false]
            }
        ]
    },
    {
        name: "Parse PIN Block: ISO Format 0",
        input: "041215FEDCBA9876",
        expectedOutput: JSON.stringify({
            format: "ISO Format 0",
            pin: "1234",
            pinLength: 4,
            pinFieldHex: "041234FFFFFFFFFF",
            panFieldHex: "0000210123456789",
            blockHex: "041215FEDCBA9876",
            fillDigitsHex: "FFFFFFFFFF"
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse PIN Block",
                args: ["ISO Format 0", "5432101234567890"]
            }
        ]
    },
    {
        name: "Translate PIN Block: ISO Format 0 to ISO Format 1",
        input: "041215FEDCBA9876",
        expectedOutput: JSON.stringify({
            source: {
                format: "ISO Format 0",
                pin: "1234",
                pinLength: 4,
                pinFieldHex: "041234FFFFFFFFFF",
                panFieldHex: "0000210123456789",
                blockHex: "041215FEDCBA9876",
                fillDigitsHex: "FFFFFFFFFF"
            },
            target: {
                format: "ISO Format 1",
                blockHex: "141234FFFFFFFFFF"
            }
        }, null, 4),
        recipeConfig: [
            {
                op: "Translate PIN Block",
                args: ["ISO Format 0", "5432101234567890", "ISO Format 1", "", false]
            }
        ]
    },
    {
        name: "Generate Card Validation Data: known CVV2 sample",
        input: "0123456789ABCDEFFEDCBA9876543210",
        expectedOutput: "221",
        recipeConfig: [
            {
                op: "Generate Card Validation Data",
                args: ["CVV2 / CVC2 (force 000)", "4123456789012345", "02", "25", "MMYY", "101", 3, false]
            }
        ]
    },
    {
        name: "Verify Card Validation Data: known CVV2 sample",
        input: "0123456789ABCDEFFEDCBA9876543210",
        expectedOutput: JSON.stringify({
            profile: "CVV2 / CVC2 (force 000)",
            pan: "4123456789012345",
            expiry: "0225",
            expiryLayout: "MMYY",
            serviceCode: "000",
            digitCount: 3,
            inputDigits: "41234567890123450225000000000000",
            resultHex: "D2D21E5FA3030D91",
            decimalized: "22153",
            validationData: "221",
            expectedValue: "221",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify Card Validation Data",
                args: ["CVV2 / CVC2 (force 000)", "4123456789012345", "02", "25", "MMYY", "101", "221"]
            }
        ]
    },
    {
        name: "Generate EMV ARQC: AES-CMAC profile",
        input: "000102030405060708090A0B0C0D0E0F",
        expectedOutput: "C1F732B52FB20CAA",
        recipeConfig: [
            {
                op: "Generate EMV ARQC",
                args: ["00112233445566778899AABBCCDDEEFF", 8, false]
            }
        ]
    },
    {
        name: "Generate EMV ARPC: AES-CMAC profile",
        input: "11223344556677889900AABBCCDDEEFF",
        expectedOutput: "312442B1A4D64F94",
        recipeConfig: [
            {
                op: "Generate EMV ARPC",
                args: ["00112233445566778899AABBCCDDEEFF", 8, false]
            }
        ]
    },
    {
        name: "Verify EMV ARQC: AES-CMAC profile",
        input: "000102030405060708090A0B0C0D0E0F",
        expectedOutput: JSON.stringify({
            inputHex: "000102030405060708090A0B0C0D0E0F",
            outputBytes: 8,
            fullMacHex: "C1F732B52FB20CAAB58D5B6C78CBD514",
            cryptogramHex: "C1F732B52FB20CAA",
            expectedArqcHex: "C1F732B52FB20CAA",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify EMV ARQC",
                args: ["00112233445566778899AABBCCDDEEFF", 8, "C1F732B52FB20CAA"]
            }
        ]
    },
    {
        name: "Encrypt Payment Data: AES CBC",
        input: "00112233445566778899AABBCCDDEEFF",
        expectedOutput: "67423557CA0509243B9EE04A5DA3448AA397F6D29B5C8BCE065D9CDC936B7F9B",
        recipeConfig: [
            {
                op: "Encrypt Payment Data",
                args: ["AES CBC", "00112233445566778899AABBCCDDEEFF", "000102030405060708090A0B0C0D0E0F", "", "Data", false]
            }
        ]
    },
    {
        name: "Decrypt Payment Data: AES CBC",
        input: "67423557CA0509243B9EE04A5DA3448AA397F6D29B5C8BCE065D9CDC936B7F9B",
        expectedOutput: "00112233445566778899AABBCCDDEEFF",
        recipeConfig: [
            {
                op: "Decrypt Payment Data",
                args: ["AES CBC", "00112233445566778899AABBCCDDEEFF", "000102030405060708090A0B0C0D0E0F", "", "Data", false]
            }
        ]
    },
    {
        name: "Re-Encrypt Payment Data: AES CBC to TDES CBC",
        input: "67423557CA0509243B9EE04A5DA3448AA397F6D29B5C8BCE065D9CDC936B7F9B",
        expectedOutput: "C47BC6E91A9D566F649D750BCE1CE9889FB5AE1489A16692",
        recipeConfig: [
            {
                op: "Re-Encrypt Payment Data",
                args: ["AES CBC", "00112233445566778899AABBCCDDEEFF", "000102030405060708090A0B0C0D0E0F", "", "Data", "TDES CBC", "0123456789ABCDEFFEDCBA9876543210", "1234567890ABCDEF", "", "Data", false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: AES-CMAC",
        input: "1122334455667788",
        expectedOutput: "339AF1AD1650E908",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", 8, false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: HMAC SHA-256",
        input: "1122334455667788",
        expectedOutput: "9300E1D36DD30415",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "HMAC SHA-256", "00112233445566778899AABBCCDDEEFF", "Hex", "", 8, false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: DUKPT MAC Request CMAC",
        input: "1122334455667788",
        expectedOutput: "3616961727FE155D",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "DUKPT MAC Request CMAC", "0123456789ABCDEFFEDCBA9876543210", "Hex", "FFFF9876543210E00008", 8, false]
            }
        ]
    },
    {
        name: "Verify Payment MAC: AES-CMAC",
        input: "1122334455667788",
        expectedOutput: JSON.stringify({
            method: "AES-CMAC",
            inputFormat: "Hex",
            inputHex: "1122334455667788",
            outputBytes: 8,
            fullMacHex: "339AF1AD1650E908A794284D91DC6D29",
            macHex: "339AF1AD1650E908",
            keySource: "Direct key input",
            expectedMacHex: "339AF1AD1650E908",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify Payment MAC",
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", "339AF1AD1650E908", true]
            }
        ]
    },
    {
        name: "Generate Payment PIN Data: ISO Format 0",
        input: "1234",
        expectedOutput: "041215FEDCBA9876",
        recipeConfig: [
            {
                op: "Generate Payment PIN Data",
                args: ["ISO Format 0", "5432101234567890", false, false]
            }
        ]
    },
    {
        name: "Translate Payment PIN Data: ISO Format 0 to ISO Format 1",
        input: "041215FEDCBA9876",
        expectedOutput: JSON.stringify({
            source: {
                format: "ISO Format 0",
                pin: "1234",
                pinLength: 4,
                pinFieldHex: "041234FFFFFFFFFF",
                panFieldHex: "0000210123456789",
                blockHex: "041215FEDCBA9876",
                fillDigitsHex: "FFFFFFFFFF"
            },
            target: {
                format: "ISO Format 1",
                blockHex: "141234FFFFFFFFFF"
            }
        }, null, 4),
        recipeConfig: [
            {
                op: "Translate Payment PIN Data",
                args: ["ISO Format 0", "5432101234567890", "ISO Format 1", "", false]
            }
        ]
    },
    {
        name: "Verify Payment PIN Data: ISO Format 0",
        input: "041215FEDCBA9876",
        expectedOutput: JSON.stringify({
            format: "ISO Format 0",
            pin: "1234",
            pinLength: 4,
            pinFieldHex: "041234FFFFFFFFFF",
            panFieldHex: "0000210123456789",
            blockHex: "041215FEDCBA9876",
            fillDigitsHex: "FFFFFFFFFF",
            expectedPin: "1234",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify Payment PIN Data",
                args: ["ISO Format 0", "5432101234567890", "1234"]
            }
        ]
    },
    {
        name: "Derive ECDH Key Material: raw shared secret",
        input: ecdhPrivateKey,
        expectedOutput: "4BE993A2D1BD25C7B5A625EDEBE48D022557ACA445C60EE403ECE9BA38A41CFE",
        recipeConfig: [
            {
                op: "Derive ECDH Key Material",
                args: ["PEM", "P-256", "PEM", ecdhPeerPublicKey, "None", 32, "", "Hex"]
            }
        ]
    },
    {
        name: "Derive ECDH Key Material: SEC1 EC private key PEM",
        input: ecdhPrivateKeySec1,
        expectedOutput: "4BE993A2D1BD25C7B5A625EDEBE48D022557ACA445C60EE403ECE9BA38A41CFE",
        recipeConfig: [
            {
                op: "Derive ECDH Key Material",
                args: ["PEM", "P-256", "PEM", ecdhPeerPublicKey, "None", 32, "", "Hex"]
            }
        ]
    }
]);
