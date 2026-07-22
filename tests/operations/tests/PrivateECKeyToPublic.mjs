/**
 * Private key to secp256k1 public key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Private EC Key to Public (Compressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "036cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e40",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [true, "secp256k1", "Public Key Only"]
            },
        ],
    },
    {
        name: "Private EC Key to Public (Uncompressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "046cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e401f8a5888434ba6abc1967c036cc28903283d0f43b53fee63a3fb0b416019892b",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false, "secp256k1", "Public Key Only"]
            },
        ],
    },
    {
        name: "Private EC Key to Public (From Bytes Uncompressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "036cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e40",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true, "secp256k1", "Public Key Only"]
            },
        ],
    },
    {
        name: "Private EC Key to Public (Wrong Length)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Error with the input as private key. Error is:\n\tInvalid length. We want either 32 or 64 but we got: 66",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false, "secp256k1", "Public Key Only"]
            },
        ],
    },
    {
        name: "Private EC Key to Public (From Bytes Uncompressed Wrong Length)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Error with the input as private key. Error is:\n\tInvalid length. We want either 32 or 64 but we got: 33",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [false, "secp256k1", "Public Key Only"]
            },
        ],
    },
    {
        name: "Exodus Solana Private Key To Address Example (Full 64 Private Key)",
        input: "S3Y5GEsCMcU15pAGb6fPAb6nG1nk6SA4nSuVLxEH9xVQdtdnDBDxE8kYkAvdnrF7xK5UTVTDeN3zKT3ZLeeBygc",
        expectedOutput: "3LzenrN4cveQZbodWxgepAHRyr7Xs53FwMQsuiD13jMS",
        recipeConfig: [
            { "op": "From Base58", "args": ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", true] },
            { "op": "Drop bytes", "args": [-32, 32, false] },
            { "op": "To Hex", "args": ["None", 32] },
            { "op": "Private EC Key to Public Key", "args": [true, "ed25519", "Public Key Only"] },
            { "op": "From Hex", "args": ["Auto"] },
            { "op": "To Base58", "args": ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"] }
        ]
    },
    {
        name: "Exodus Solana Private Key To Address Example Private Key to Full Solana Private Key",
        input: "1598c4d3c92419359a1901eb9ee4f7836e999959737d002c3b2128aa592bd364",
        expectedOutput: "S3Y5GEsCMcU15pAGb6fPAb6nG1nk6SA4nSuVLxEH9xVQdtdnDBDxE8kYkAvdnrF7xK5UTVTDeN3zKT3ZLeeBygc",
        // To regenerate in Exodus use seedphrase: announce mesh cake need drink better dwarf profit cute lady want foster
        // Should be first Solana address in Exodus.
        recipeConfig: [
            { "op": "Private EC Key to Public Key", "args": [true, "ed25519", "Private,Public"] },
            { "op": "Find / Replace", "args": [{ "option": "Regex", "string": "," }, "", true, false, true, false] },
            { "op": "From Hex", "args": ["Auto"] },
            { "op": "To Base58", "args": ["123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"] }
        ]
    },
    {
        name: "Private EC Key to Public Wrong Curve",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "Curve must be one of the following: secp256k1, ed25519.",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false, "secp256k2", "Public Key Only"]
            },
        ],
    },
    {
        name: "Private EC Key to Public Wrong Option",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "Output Option must be one of the following: Public Key Only, Private,Public, Public,Private.",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false, "secp256k1", "Public Key Onl"]
            },
        ],
    },
]);
