/**
 * Keystore tests
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Decrypt Keystore File: With Address",
        input: '{"address": "e6ff69353a16c9a5b139c79f6499d8ad74bfeceb", "crypto": {"cipher": "aes-128-ctr", "cipherparams": {"iv": "8cab4ff1613bb10cec166c69226e3ce5"}, "ciphertext": "78490968f75a8698660da5993395d2f561f41cd008498b349fd1bb4124eb3b72", "kdf": "scrypt", "kdfparams": {"dklen": 32, "n": 262144, "r": 1, "p": 8, "salt": "198fed004cf1d8cfd3d0ef8b2f99e058"}, "mac": "511ca8716f86a1853370d868478f57bdd19058a9464558750ff304e12a2cfd56"}, "id": "e130c4be-f3cf-4a22-bb80-4d3e948eb827", "version": 3}',
        expectedOutput: "128538fd0b0e53d52ac4c4dcd66badaec5c83eacd4d31709979dca31f5e761c7",
        recipeConfig: [
            {
                "op": "Decrypt Keystore File",
                "args": ["password1234"]
            }
        ],
    },
    {
        name: "Decrypt Keystore File: Cast to Address",
        input: '{"address": "e6ff69353a16c9a5b139c79f6499d8ad74bfeceb", "crypto": {"cipher": "aes-128-ctr", "cipherparams": {"iv": "8cab4ff1613bb10cec166c69226e3ce5"}, "ciphertext": "78490968f75a8698660da5993395d2f561f41cd008498b349fd1bb4124eb3b72", "kdf": "scrypt", "kdfparams": {"dklen": 32, "n": 262144, "r": 1, "p": 8, "salt": "198fed004cf1d8cfd3d0ef8b2f99e058"}, "mac": "511ca8716f86a1853370d868478f57bdd19058a9464558750ff304e12a2cfd56"}, "id": "e130c4be-f3cf-4a22-bb80-4d3e948eb827", "version": 3}',
        expectedOutput: "0xe6ff69353a16c9a5b139c79f6499d8ad74bfeceb",
        recipeConfig: [
            {
                "op": "Decrypt Keystore File",
                "args": ["password1234"]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [false]
            },
            {
                "op": "Public Key To ETH Style Address",
                "args": []
            }
        ]

    }

]);
