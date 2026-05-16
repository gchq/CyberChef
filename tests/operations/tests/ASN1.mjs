/**
 * ASN.1 / OID / PEM tests.
 *
 * Covers the four operations migrated from jsrsasign to the in-house
 * Asn1.mjs helper:
 *   - Hex to Object Identifier
 *   - Object Identifier to Hex
 *   - Hex to PEM
 *   - Parse ASN.1 hex string
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Hex to Object Identifier: rsaEncryption (1.2.840.113549.1.1.1)",
        input: "2a864886f70d010101",
        expectedOutput: "1.2.840.113549.1.1.1",
        recipeConfig: [{ op: "Hex to Object Identifier", args: [] }],
    },
    {
        name: "Hex to Object Identifier: commonName (2.5.4.3)",
        input: "550403",
        expectedOutput: "2.5.4.3",
        recipeConfig: [{ op: "Hex to Object Identifier", args: [] }],
    },
    {
        name: "Hex to Object Identifier: Microsoft CTL signing (1.3.6.1.4.1.311.2.1.4) — multi-byte arc",
        input: "2b060104018237020104",
        expectedOutput: "1.3.6.1.4.1.311.2.1.4",
        recipeConfig: [{ op: "Hex to Object Identifier", args: [] }],
    },
    {
        name: "Hex to Object Identifier: handles whitespace in input",
        input: "55 04 03",
        expectedOutput: "2.5.4.3",
        recipeConfig: [{ op: "Hex to Object Identifier", args: [] }],
    },

    {
        name: "Object Identifier to Hex: rsaEncryption",
        input: "1.2.840.113549.1.1.1",
        expectedOutput: "2a864886f70d010101",
        recipeConfig: [{ op: "Object Identifier to Hex", args: [] }],
    },
    {
        name: "Object Identifier to Hex: commonName",
        input: "2.5.4.3",
        expectedOutput: "550403",
        recipeConfig: [{ op: "Object Identifier to Hex", args: [] }],
    },
    {
        name: "Object Identifier to Hex: Microsoft CTL signing (multi-byte arc)",
        input: "1.3.6.1.4.1.311.2.1.4",
        expectedOutput: "2b060104018237020104",
        recipeConfig: [{ op: "Object Identifier to Hex", args: [] }],
    },
    {
        name: "Object Identifier to Hex: 2.999 (multi-byte first combined arc)",
        input: "2.999",
        expectedOutput: "8837",
        recipeConfig: [{ op: "Object Identifier to Hex", args: [] }],
    },

    {
        name: "Hex to PEM: short payload",
        input: "48656c6c6f",
        expectedOutput: "-----BEGIN CERTIFICATE-----\nSGVsbG8=\n-----END CERTIFICATE-----\n",
        recipeConfig: [{ op: "Hex to PEM", args: ["CERTIFICATE"] }],
    },
    {
        name: "Hex to PEM: wraps at 64 base64 characters",
        // 60 bytes -> 80 base64 chars (no padding) -> wraps after 64
        input: "00".repeat(60),
        expectedOutput: "-----BEGIN PUBLIC KEY-----\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nAAAAAAAAAAAAAAAA\n-----END PUBLIC KEY-----\n",
        recipeConfig: [{ op: "Hex to PEM", args: ["PUBLIC KEY"] }],
    },

    {
        name: "Parse ASN.1 hex string: simple SEQUENCE of two INTEGERs",
        input: "3006020101020102",
        expectedOutput: "SEQUENCE\n  INTEGER 1\n  INTEGER 2",
        recipeConfig: [{ op: "Parse ASN.1 hex string", args: [0, 32] }],
    },
    {
        name: "Parse ASN.1 hex string: SEQUENCE { OID, NULL }",
        input: "300d06092a864886f70d0107010500",
        expectedOutput: "SEQUENCE\n  ObjectIdentifier 1.2.840.113549.1.7.1\n  NULL",
        recipeConfig: [{ op: "Parse ASN.1 hex string", args: [0, 32] }],
    },
]);
