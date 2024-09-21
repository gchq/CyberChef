/**
 * SM2 Tests
 * 
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

/* Plaintexts */

const SMALL_PLAIN = "I am a small plaintext"
const LARGE_PLAIN = "I am a larger plaintext, that will require the encryption KDF to generate a much larger key to properly encrypt me"

/* Test Key Parameters */
const PUBLIC_X = "f7d903cab7925066c31150a92b31e548e63f954f92d01eaa0271fb2a336baef8"
const PUBLIC_Y = "fb0c45e410ef7a6cdae724e6a78dbff52562e97ede009e762b667d9b14adea6c"
const PRIVATE_K = "e74a72505084c3269aa9b696d603e3e08c74c6740212c11a31e26cdfe08bdf6a"

const CURVE = "sm2p256v1"

/* Decryption Test Ciphertext*/

const CIPHERTEXT_1 = "9a31bc0adb4677cdc4141479e3949572a55c3e6fb52094721f741c2bd2e179aaa87be6263bc1be602e473be3d5de5dce97f8248948b3a7e15f9f67f64aef21575e0c05e6171870a10ff9ab778dbef24267ad90e1a9d47d68f757d57c4816612e9829f804025dea05a511cda39371c22a2828f976f72e"
const CIPHERTEXT_2 = "d3647d68568a2e7a4f8e843286be7bf2b4d80256697d19a73df306ae1a7e6d0364d942e23d2340606e7a2502a838b132f9242587b2ea7e4c207e87242eea8cae68f5ff4da2a95a7f6d350608ae5b6777e1d925bf9c560087af84aba7befba713130106ddb4082d803811bca3864594722f3198d58257fe4ba37f4aa540adf4cb0568bddd2d8140ad3030deea0a87e3198655cc4d22bfc3d73b1c4afec2ff15d68c8d1298d97132cace922ee8a4e41ca288a7e748b77ca94aa81dc283439923ae7939e00898e16fe5111fbe1d928d152b216a"
const CIPHERTEXT_3 = "5f340eeb4398fa8950ee3408d0e3fe34bf7728c9fdb060c94b916891b5c693610274160b52a7132a2bf16ad5cdb57d1e00da2f3ddbd55350729aa9c268b53e40c05ccce9912daa14406e8c132e389484e69757350be25351755dcc6c25c94b3c1a448b2cf8c2017582125eb6cf782055b199a875e966"
const CIPHERTEXT_4 = "0649bac46c3f9fd7fb3b2be4bff27414d634651efd02ca67d8c802bbc5468e77d035c39b581d6b56227f5d87c0b4efbea5032c0761139295ae194b9f1fce698f2f4b51d89fa5554171a1aad2e61fe9de89831aec472ecc5ab178ebf4d2230c1fb94fca03e536b87b9eba6db71ba9939260a08ffd230ca86cb45cf754854222364231bdb8b873791d63ad57a4b3fa5b6375388dc879373f5f1be9051bc5072a8afbec5b7b034e4907aa5bb4b6b1f50e725d09cb6a02e07ce20263005f6c9157ce05d3ea739d231d4f09396fb72aa680884d78"


TestRegister.addTests([
    {
        name: "SM2 Decrypt: Small Input; Format One",
        input: CIPHERTEXT_1,
        expectedOutput: SMALL_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C3C2", CURVE]
            }
        ]
    },
    {
        name: "SM2 Decrypt: Large Input; Format One",
        input: CIPHERTEXT_2,
        expectedOutput: LARGE_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C3C2", CURVE]
            }
        ]
    },
    {
        name: "SM2 Decrypt: Small Input; Format Two",
        input: CIPHERTEXT_3,
        expectedOutput: SMALL_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C2C3", CURVE]
            }
        ]
    },
    {
        name: "SM2 Decrypt: Large Input; Format Two",
        input: CIPHERTEXT_4,
        expectedOutput: LARGE_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C2C3", CURVE]
            }
        ]
    },
    {
        name: "SM2 Encrypt And Decrypt: Small Input; Format One",
        input: SMALL_PLAIN,
        expectedOutput: SMALL_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Encrypt",
                "args": [PUBLIC_X, PUBLIC_Y, "C1C3C2", CURVE],
            },
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C3C2", CURVE]
            }
        ]
    },
    {
        name: "SM2 Encrypt And Decrypt: Large Input; Format One",
        input: LARGE_PLAIN,
        expectedOutput: LARGE_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Encrypt",
                "args": [PUBLIC_X, PUBLIC_Y, "C1C3C2", CURVE],
            },
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C3C2", CURVE]
            }
        ]
    },
    {
        name: "SM2 Encrypt And Decrypt: Small Input; Format Two",
        input: SMALL_PLAIN,
        expectedOutput: SMALL_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Encrypt",
                "args": [PUBLIC_X, PUBLIC_Y, "C1C2C3", CURVE],
            },
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C2C2", CURVE]
            }
        ]
    },
    {
        name: "SM2 Encrypt And Decrypt: Large Input; Format Two",
        input: LARGE_PLAIN,
        expectedOutput: LARGE_PLAIN,
        recipeConfig: [
            {
                "op": "SM2 Encrypt",
                "args": [PUBLIC_X, PUBLIC_Y, "C1C2C3", CURVE],
            },
            {
                "op": "SM2 Decrypt",
                "args": [PRIVATE_K, "C1C2C3", CURVE]
            }
        ]
    },
]);
