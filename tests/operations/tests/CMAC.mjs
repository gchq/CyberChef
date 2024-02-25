/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// values in "NIST's CSRC" testcases are taken from here:
// https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/example-values

TestRegister.addTests([
    {
        name: "CMAC-AES128 NIST's CSRC Example #1",
        input: "",
        expectedOutput: "bb1d6929e95937287fa37d129b756746",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "2b7e151628aed2a6abf7158809cf4f3c",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES128 NIST's CSRC Example #2",
        input: "6bc1bee22e409f96e93d7e117393172a",
        expectedOutput: "070a16b46b4d4144f79bdd9dd04a287c",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "2b7e151628aed2a6abf7158809cf4f3c",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES128 NIST's CSRC Example #3",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a57",
        expectedOutput: "7d85449ea6ea19c823a7bf78837dfade",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "2b7e151628aed2a6abf7158809cf4f3c",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES128 NIST's CSRC Example #4",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
        expectedOutput: "51f0bebf7e3b9d92fc49741779363cfe",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "2b7e151628aed2a6abf7158809cf4f3c",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES192 NIST's CSRC Example #1",
        input: "",
        expectedOutput: "d17ddf46adaacde531cac483de7a9367",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES192 NIST's CSRC Example #2",
        input: "6bc1bee22e409f96e93d7e117393172a",
        expectedOutput: "9e99a7bf31e710900662f65e617c5184",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES192 NIST's CSRC Example #3",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a57",
        expectedOutput: "3d75c194ed96070444a9fa7ec740ecf8",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES192 NIST's CSRC Example #4",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
        expectedOutput: "a1d5df0eed790f794d77589659f39a11",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES256 NIST's CSRC Example #1",
        input: "",
        expectedOutput: "028962f61b7bf89efc6b551f4667d983",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES256 NIST's CSRC Example #2",
        input: "6bc1bee22e409f96e93d7e117393172a",
        expectedOutput: "28a7023f452e8f82bd4bf28d8c37c35c",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES256 NIST's CSRC Example #3",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a57",
        expectedOutput: "156727dc0878944a023c1fe03bad6d93",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES256 NIST's CSRC Example #4",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
        expectedOutput: "e1992190549f6ed5696a2c056c315410",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (1) NIST's CSRC Sample #1",
        input: "",
        expectedOutput: "7db0d37df936c550",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef01456789abcdef0123",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (1) NIST's CSRC Sample #2",
        input: "6bc1bee22e409f96e93d7e117393172a",
        expectedOutput: "30239cf1f52e6609",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef01456789abcdef0123",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (1) NIST's CSRC Sample #3",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a57",
        expectedOutput: "6c9f3ee4923f6be2",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef01456789abcdef0123",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (1) NIST's CSRC Sample #4",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e51",
        expectedOutput: "99429bd0bf7904e5",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef01456789abcdef0123",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (2) NIST's CSRC Sample #1",
        input: "",
        expectedOutput: "79ce52a7f786a960",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef010123456789abcdef",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (2) NIST's CSRC Sample #2",
        input: "6bc1bee22e409f96e93d7e117393172a",
        expectedOutput: "cc18a0b79af2413b",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef010123456789abcdef",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (2) NIST's CSRC Sample #3",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a57",
        expectedOutput: "c06d377ecd101969",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef010123456789abcdef",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES (2) NIST's CSRC Sample #4",
        input: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e51",
        expectedOutput: "9cd33580f9b64dfb",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "0123456789abcdef23456789abcdef010123456789abcdef",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
    {
        name: "CMAC-AES: invalid key length",
        input: "",
        expectedOutput:
            "The key for AES must be either 16, 24, or 32 bytes (currently 20 bytes)",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "00112233445566778899aabbccddeeff01234567",
                    },
                    "AES",
                ],
            },
        ],
    },
    {
        name: "CMAC-TDES: invalid key length",
        input: "",
        expectedOutput:
            "The key for Triple DES must be 16 or 24 bytes (currently 20 bytes)",
        recipeConfig: [
            {
                op: "CMAC",
                args: [
                    {
                        option: "Hex",
                        string: "00112233445566778899aabbccddeeff01234567",
                    },
                    "Triple DES",
                ],
            },
        ],
    },
]);
