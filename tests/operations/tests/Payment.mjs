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
        name: "Parse Thales payShield command: header, LMK identifier, trailer",
        input: "HEADHE0123456789ABCDEF0011223344556677%00TAIL",
        expectedOutput: JSON.stringify({
            rawInput: "HEADHE0123456789ABCDEF0011223344556677%00TAIL",
            framing: {
                stxPresent: true,
                etxPresent: true,
                endMessageDelimiterPresent: true
            },
            normalizedMessage: "HEADHE0123456789ABCDEF0011223344556677%00",
            messageHeaderLength: 4,
            messageHeader: "HEAD",
            commandCode: "HE",
            commandCodeType: "request",
            commandNames: ["Encrypt Data Block"],
            requestCodes: ["HE"],
            expectedResponseCodes: ["HF"],
            manualPages: [107],
            payload: "0123456789ABCDEF0011223344556677",
            payloadLength: 32,
            lmkIdentifier: "00",
            lmkIdentifierDelimiterPresent: true,
            tildeDelimiterPresentBeforeLmkIdentifier: false,
            messageTrailer: "TAIL",
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse Thales payShield Command",
                args: [4]
            }
        ]
    },
    {
        name: "Parse Thales payShield command: trailing tilde before LMK identifier",
        input: "MA0123456789ABCDEFHELLO~%12",
        expectedOutput: JSON.stringify({
            rawInput: "MA0123456789ABCDEFHELLO~%12",
            framing: {
                stxPresent: false,
                etxPresent: false,
                endMessageDelimiterPresent: false
            },
            normalizedMessage: "MA0123456789ABCDEFHELLO~%12",
            messageHeaderLength: 0,
            messageHeader: "",
            commandCode: "MA",
            commandCodeType: "request",
            commandNames: ["Generate a MAC"],
            requestCodes: ["MA"],
            expectedResponseCodes: ["MB"],
            manualPages: [90],
            payload: "0123456789ABCDEFHELLO",
            payloadLength: 21,
            lmkIdentifier: "12",
            lmkIdentifierDelimiterPresent: true,
            tildeDelimiterPresentBeforeLmkIdentifier: true,
            messageTrailer: "",
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse Thales payShield Command",
                args: [0]
            }
        ]
    },
    {
        name: "Parse Futurex Excrypt command: bracketed fields",
        input: "[AOGMAC;FS6;RV0011223344556677;]",
        expectedOutput: JSON.stringify({
            rawInput: "[AOGMAC;FS6;RV0011223344556677;]",
            openingDelimiterPresent: true,
            closingDelimiterPresent: true,
            body: "AOGMAC;FS6;RV0011223344556677;",
            rawFields: [
                "AOGMAC",
                "FS6",
                "RV0011223344556677"
            ],
            fields: [
                {
                    raw: "AOGMAC",
                    tag: "AO",
                    value: "GMAC"
                },
                {
                    raw: "FS6",
                    tag: "FS",
                    value: "6"
                },
                {
                    raw: "RV0011223344556677",
                    tag: "RV",
                    value: "0011223344556677"
                }
            ],
            commandFieldTag: "AO",
            commandCode: "GMAC",
            commandName: "Generate Message Authentication Code",
            fieldCount: 3,
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse Futurex Excrypt Command",
                args: []
            }
        ]
    },
    {
        name: "Parse Futurex Excrypt command: missing closing delimiter",
        input: "[AOVMAC;FS6;RV89ABCDEF",
        expectedOutput: JSON.stringify({
            rawInput: "[AOVMAC;FS6;RV89ABCDEF",
            openingDelimiterPresent: true,
            closingDelimiterPresent: false,
            body: "AOVMAC;FS6;RV89ABCDEF",
            rawFields: [
                "AOVMAC",
                "FS6",
                "RV89ABCDEF"
            ],
            fields: [
                {
                    raw: "AOVMAC",
                    tag: "AO",
                    value: "VMAC"
                },
                {
                    raw: "FS6",
                    tag: "FS",
                    value: "6"
                },
                {
                    raw: "RV89ABCDEF",
                    tag: "RV",
                    value: "89ABCDEF"
                }
            ],
            commandFieldTag: "AO",
            commandCode: "VMAC",
            commandName: "Verify Message Authentication Code",
            fieldCount: 3,
            notes: [
                "Message is missing one or both expected Excrypt outer delimiters."
            ]
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse Futurex Excrypt Command",
                args: []
            }
        ]
    },
    {
        name: "Parse TR-31 key block: fixed header only",
        input: "D0016D0AB00E0000",
        expectedOutput: JSON.stringify({
            raw: "D0016D0AB00E0000",
            fixedHeader: {
                raw: "D0016D0AB00E0000",
                versionId: "D",
                versionDescription: "ANSI X9.24-2 (2017) — AES, Key Derivation Binding Method (current PCI standard)",
                declaredBlockLength: 16,
                keyUsage: "D0",
                keyUsageDescription: "Symmetric Data Encryption Key (DEK)",
                algorithm: "A",
                algorithmDescription: "AES",
                modeOfUse: "B",
                modeOfUseDescription: "Both Encrypt and Decrypt / Both Generate and Verify",
                keyVersionNumber: "00",
                exportability: "E",
                exportabilityDescription: "Exportable — can be wrapped under a KEK in a trusted key block",
                optionalBlocksDeclared: 0,
                reserved: "00"
            },
            compliance: [
                "OK: Version D (AES Key Derivation) — current PCI-required format",
                "NOTE: Exportable key — verify the wrapping KEK is a PCI-approved key block protection key"
            ],
            optionalBlocks: [],
            bodyOffset: 16,
            remainingBody: "",
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse TR-31 Key Block",
                args: [true]
            }
        ]
    },
    {
        name: "Parse TR-34 key transport: split sections",
        input: "001730303030423930303100112233300030303034AABBCCDD",
        expectedOutput: JSON.stringify({
            declaredLength: 23,
            actualLengthExcludingLengthField: 23,
            header: "0000",
            messageType: "B9",
            messageDescription: "BindResponse — final key delivery; contains CMS EnvelopedData + signature",
            errorCode: "00",
            errorDescription: "Success",
            authData: {
                hex: "3100",
                byteCount: 2,
                asnOuter: null
            },
            kcvHex: "112233",
            envelopeData: {
                hex: "3000",
                byteCount: 2,
                description: "CMS EnvelopedData — wrapped symmetric key (decrypt with KRD private RSA key)",
                asnOuter: {
                    tag: "0x30 (SEQUENCE)",
                    headerBytes: 2,
                    valueLength: 0,
                    totalExpected: 2,
                    complete: true
                }
            },
            signatureLengthAscii: "0004",
            signatureLength: 4,
            signatureHex: "AABBCCDD",
            trailingHex: "",
            notes: []
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse TR-34 Key Transport",
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
        name: "Derive DUKPT TDES Key: known IPEK vector",
        input: "0123456789ABCDEFFEDCBA9876543210",
        expectedOutput: "6AC292FAA1315B4D858AB3A3D7D5933A",
        recipeConfig: [
            {
                op: "Derive DUKPT TDES Key",
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
        name: "Generate Test PAN: Visa curated sample",
        input: "",
        expectedOutput: JSON.stringify({
            brand: "Visa",
            mode: "Curated sample",
            pan: "4024140000000131",
            source: "Public Visa test PAN published in Mastercard AVS scenario documentation.",
            network: "Visa",
            majorIndustryIdentifier: "4",
            majorIndustryIdentifierDescription: "Banking and financial (Visa)",
            issuerIdentificationNumber: "40241400",
            length: 16,
            luhnValid: true,
            matchedRule: {
                rangeStart: "4",
                rangeEnd: "4",
                lengths: [13, 16, 19],
                description: "Visa cards begin with 4."
            }
        }, null, 4),
        recipeConfig: [
            {
                op: "Generate Test PAN",
                args: ["Visa", "Curated sample", 16, true]
            }
        ]
    },
    {
        name: "Generate Test PAN: American Express curated sample",
        input: "",
        expectedOutput: "371449635398431",
        recipeConfig: [
            {
                op: "Generate Test PAN",
                args: ["American Express", "Curated sample", 15, false]
            }
        ]
    },
    {
        name: "Parse PAN: Discover sample",
        input: "6011000991543426",
        expectedOutput: JSON.stringify({
            pan: "6011000991543426",
            network: "Discover",
            cardType: "Credit",
            cardTypeConfidence: "medium",
            cardTypeNote: "The common Discover BIN ranges (6011, 644-649, 65, 622126-622925) are predominantly credit cards. Discover does offer some debit products on separate BIN ranges.",
            majorIndustryIdentifier: "6",
            majorIndustryIdentifierDescription: "Merchandising and banking (Discover, Maestro)",
            issuerIdentificationNumber: "60110009",
            length: 16,
            luhnValid: true,
            matchedRule: {
                rangeStart: "6011",
                rangeEnd: "6011",
                lengths: [16, 17, 18, 19],
                description: "Discover range 6011."
            }
        }, null, 4),
        recipeConfig: [
            {
                op: "Parse PAN",
                args: []
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
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", "Method 1", 8, false]
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
                args: ["Hex", "HMAC SHA-256", "00112233445566778899AABBCCDDEEFF", "Hex", "", "Method 1", 8, false]
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
                args: ["Hex", "DUKPT MAC Request CMAC", "0123456789ABCDEFFEDCBA9876543210", "Hex", "FFFF9876543210E00008", "Method 1", 8, false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: ISO 9797-1 Algorithm 1",
        input: "1122334455667788",
        expectedOutput: "0C949BCDEF6FDF1D",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "ISO 9797-1 Algorithm 1", "0123456789ABCDEFFEDCBA9876543210", "Hex", "", "Method 1", 8, false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: ISO 9797-1 Algorithm 3",
        input: "1122334455667788",
        expectedOutput: "7E2AEA5CF35FDC0E",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "ISO 9797-1 Algorithm 3", "0123456789ABCDEFFEDCBA9876543210", "Hex", "", "Method 2", 8, false]
            }
        ]
    },
    {
        name: "Generate Payment MAC: AS2805-4.1",
        input: "1122334455667788",
        expectedOutput: "3EB3B72576BBBE83",
        recipeConfig: [
            {
                op: "Generate Payment MAC",
                args: ["Hex", "AS2805-4.1", "0123456789ABCDEFFEDCBA9876543210", "Hex", "", "Method 1", 8, false]
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
            paddingMethod: null,
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
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", "Method 1", "339AF1AD1650E908", true]
            }
        ]
    },
    {
        name: "Generate EMV MAC: issuer script sample",
        input: "8424000008999E57FD0F47CACE0007",
        expectedOutput: "22CB48394DFD1977",
        recipeConfig: [
            {
                op: "Generate EMV MAC",
                args: ["0123456789ABCDEFFEDCBA9876543210", 8, false]
            }
        ]
    },
    {
        name: "Verify EMV MAC: issuer script sample",
        input: "8424000008999E57FD0F47CACE0007",
        expectedOutput: JSON.stringify({
            algorithm: "EMV MAC",
            paddingMethod: "Method 2",
            inputHex: "8424000008999E57FD0F47CACE0007",
            fullMacHex: "22CB48394DFD1977",
            macHex: "22CB48394DFD1977",
            expectedMacHex: "22CB48394DFD1977",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify EMV MAC",
                args: ["0123456789ABCDEFFEDCBA9876543210", "22CB48394DFD1977", true]
            }
        ]
    },
    {
        name: "Generate EMV MAC For PIN Change: issuer script sample",
        input: "00A4040008A000000004101080D80500000001010A04000000000000",
        expectedOutput: "C0F24786EF1C4522",
        recipeConfig: [
            {
                op: "Generate EMV MAC For PIN Change",
                args: ["67FB27C75580EFE7", "0123456789ABCDEFFEDCBA9876543210", 8, false]
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
        name: "Generate IBM 3624 PIN Offset: known sample",
        input: "1234",
        expectedOutput: JSON.stringify({
            pinVerificationKeyHex: "0123456789ABCDEFFEDCBA9876543210",
            pinValidationData: "5432101234567890",
            pinValidationDataPadCharacter: "F",
            pinLength: 4,
            validationBlockHex: "5432101234567890",
            encryptedValidationBlockHex: "8A3712EE04F010A0",
            decimalized: "8037124404501000",
            naturalPin: "8037",
            pin: "1234",
            pinOffset: "3207"
        }, null, 4),
        recipeConfig: [
            {
                op: "Generate IBM 3624 PIN Offset",
                args: ["0123456789ABCDEFFEDCBA9876543210", "0123456789012345", "5432101234567890", "F", true]
            }
        ]
    },
    {
        name: "Verify IBM 3624 PIN: known sample",
        input: "1234",
        expectedOutput: JSON.stringify({
            pinVerificationKeyHex: "0123456789ABCDEFFEDCBA9876543210",
            pinValidationData: "5432101234567890",
            pinValidationDataPadCharacter: "F",
            pinLength: 4,
            validationBlockHex: "5432101234567890",
            encryptedValidationBlockHex: "8A3712EE04F010A0",
            decimalized: "8037124404501000",
            naturalPin: "8037",
            pin: "1234",
            pinOffset: "3207",
            expectedPinOffset: "3207",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify IBM 3624 PIN",
                args: ["0123456789ABCDEFFEDCBA9876543210", "0123456789012345", "5432101234567890", "F", "3207", true]
            }
        ]
    },
    {
        name: "Generate VISA PVV: known sample",
        input: "1234",
        expectedOutput: JSON.stringify({
            pinVerificationKeyHex: "0123456789ABCDEFFEDCBA9876543210",
            pan: "5432101234567890",
            pinVerificationKeyIndex: 1,
            pin: "1234",
            pvvInput: "1012345678911234",
            encryptedPvvInputHex: "6A77E65CFE349D60",
            pvv: "6077"
        }, null, 4),
        recipeConfig: [
            {
                op: "Generate VISA PVV",
                args: ["0123456789ABCDEFFEDCBA9876543210", "5432101234567890", 1, true]
            }
        ]
    },
    {
        name: "Verify VISA PVV: known sample",
        input: "1234",
        expectedOutput: JSON.stringify({
            pinVerificationKeyHex: "0123456789ABCDEFFEDCBA9876543210",
            pan: "5432101234567890",
            pinVerificationKeyIndex: 1,
            pin: "1234",
            pvvInput: "1012345678911234",
            encryptedPvvInputHex: "6A77E65CFE349D60",
            pvv: "6077",
            expectedPvv: "6077",
            valid: true
        }, null, 4),
        recipeConfig: [
            {
                op: "Verify VISA PVV",
                args: ["0123456789ABCDEFFEDCBA9876543210", "5432101234567890", 1, "6077", true]
            }
        ]
    },
    {
        name: "Generate AS2805 KEK Validation: response sample",
        input: "0123456789ABCDEFFEDCBA9876543210",
        expectedOutput: JSON.stringify({
            validationType: "KekValidationResponse",
            deriveKeyAlgorithm: "TDES_2KEY",
            randomKeySendVariantMask: "VARIANT_MASK_82",
            keyCheckValue: "08D7B4",
            randomKeySend: "9217DC67B8763BABCFDF3DADFCD0F84A",
            randomKeyReceive: "6DE823984789C4543020C252032F07B5"
        }, null, 4),
        recipeConfig: [
            {
                op: "Generate AS2805 KEK Validation",
                args: ["KekValidationResponse", "TDES_2KEY", "VARIANT_MASK_82", "9217DC67B8763BABCFDF3DADFCD0F84A", true]
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
