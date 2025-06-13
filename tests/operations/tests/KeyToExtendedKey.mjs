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
        name: "Key To Extended Key (Basic, XPRV)",
        input: "f55acd736ff0f80f2cdc56ab5ac1e4d4ce92e1f46d137a282a61e706681df9c5",
        expectedOutput: "xprv9s21ZrQH143K4bXtdSLbsWGSfAok775A1bF3YwPeHe8ePa7QwD5V4kK1RmdZV2M6TKVfszKt19UaHfyqdQ2MZ8dv2t7G2Tvtxnef7Pxu8Qu",
        recipeConfig: [
            {
                "op": "Key To Extended Key",
                "args": [
                    {
                        "option": "Hex",
                        "string": "fedf6c5ebcc2fc7b66291e55501a005886128bf97aeced3a91478a0c44f54dbe"
                    },
                    "xprv"
                ]
            }
        ],
    },
    {
        name: "Key To Extended Key (YPRV Same Data)",
        input: "f55acd736ff0f80f2cdc56ab5ac1e4d4ce92e1f46d137a282a61e706681df9c5",
        expectedOutput: "yprvABrGsX5C9janutj1To8E5bMwq8xC3j4evhmGLLHXfeWXSfveBsF3goy9Syb9Uw11rxcUdTvSToq8AxbQM6SNMNKWuDogcNkPEWiJVuszXFR",
        recipeConfig: [
            {
                "op": "Key To Extended Key",
                "args": [
                    {
                        "option": "Hex",
                        "string": "fedf6c5ebcc2fc7b66291e55501a005886128bf97aeced3a91478a0c44f54dbe"
                    },
                    "yprv"
                ]
            }
        ],
    },
    {
        name: "Key To Extended Key (Public Key With Private Version), Should Throw Error.",
        input: "02233f618dad285dc8b03eb7bf9a59dec039b7c1b2433dabdca636e17e10890e85",
        expectedOutput: "Error: Mis-Match between version and key type. Public Key is entered, but a private version is selected.",
        recipeConfig: [
            {
                "op": "Key To Extended Key",
                "args": [
                    {
                        "option": "Hex",
                        "string": "cda6685894f356bdf1bd6af6cb7e3961e550fb9c9b2c82d9ebfd89f48c2afea6"
                    },
                    "xprv"
                ]
            }
        ],
    },
    {
        name: "Key To Extended Key (Private Key With Public Version), Should Throw Error.",
        input: "f55acd736ff0f80f2cdc56ab5ac1e4d4ce92e1f46d137a282a61e706681df9c5",
        expectedOutput: "Error: Mis-Match between version and key type. Private Key is entered, but a public version is selected.",
        recipeConfig: [
            {
                "op": "Key To Extended Key",
                "args": [
                    {
                        "option": "Hex",
                        "string": "fedf6c5ebcc2fc7b66291e55501a005886128bf97aeced3a91478a0c44f54dbe"
                    },
                    "xpub"
                ]
            }
        ],
    },

]);
