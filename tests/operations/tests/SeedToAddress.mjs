/**
 * Key To Extended Key Tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Seed To BIP44 Bitcoin",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "1GViQ3SAjSy6bPfYy95ovP5KgXcBBnxVpm",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "44'/0'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2PKH (V1 BTC Addresses)"]
            }
        ],
    },
    {
        name: "Seed To BIP49 Bitcoin",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "34pwQXUVjMcbC4DFVeAopUiCMuZzrbnmbK",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "49'/0'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)"]
            }
        ],
    },
    {
        name: "Seed To BIP84 Bitcoin",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "bc1q3t8jjjxne03j5g6chg74wwgqeadaeyeess0u94",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "84'/0'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Segwit (P2WPKH bc1 Addresses)"]
            }
        ],
    },
    {
        name: "Seed To BIP86 Bitcoin",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "bc1p6fr48xprdq45qjq6s3ymnt8rllrjz0jgysn46rxwudl5rhfgtqaq7255nd",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "86'/0'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To Bitcoin-Like Address",
                "args": ["BTC", "Taproot (P2TR bc1p Addresses)"]
            }
        ],
    },
    {
        name: "Seed To BIP44 ETH",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "0x370b9b86dbde4fd8587c27ce28d7ee39ed9ea4dc",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "44'/60'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            }
        ],
    },
    {
        name: "Seed To BIP44 TRX",
        input: "monkey envelope scatter sword confirm hidden tool scale stay local guilt number",
        expectedOutput: "TK3N2jjVUArH2Gy7iM6UkArsUou4vHQMhz",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args":
                [
                    "bip39",
                    {
                        "option": "UTF8",
                        "string": ""
                    }
                ]
            },
            {
                "op": "Seed To Master Key",
                "args":
                [
                    "xprv"
                ]
            },
            {
                "op": "BIP32Derive",
                "args":
                [
                    "44'/195'/0'/0/0"
                ]
            },
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
            {
                "op": "JPath expression",
                "args": ["$['masterkey']", "\\n"]
            },
            {
                "op": "Find / Replace",
                "args":
                [
                    {
                        "option": "Simple string", "string": "\""
                    },
                    "",
                    true,
                    false,
                    true,
                    false
                ]
            },
            {
                "op": "Drop bytes",
                "args": [0, 2, false]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true]
            },
            {
                "op": "Public Key To TRX Style Address",
                "args": []
            }
        ],
    }


]);
