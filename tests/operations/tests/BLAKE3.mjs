/**
 * BLAKE3 tests.
 * @author xumptex [xumptex@outlook.fr]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "BLAKE3: 8 - Hello world",
        input: "Hello world",
        expectedOutput: "e7e6fb7d2869d109",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, ""] }
        ]
    },
    {
        name: "BLAKE3: 16 - Hello world 2",
        input: "Hello world 2",
        expectedOutput: "2a3df5fe5f0d3fcdd995fc203c7f7c52",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [16, ""] }
        ]
    },
    {
        name: "BLAKE3: 32 - Hello world",
        input: "Hello world",
        expectedOutput: "e7e6fb7d2869d109b62cdb1227208d4016cdaa0af6603d95223c6a698137d945",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [32, ""] }
        ]
    },
    {
        name: "BLAKE3: Key Test",
        input: "Hello world",
        expectedOutput: "59dd23ac9d025690",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, "ThiskeyisexactlythirtytwoBytesLo"] }
        ]
    },
    {
        name: "BLAKE3: Key Test 2",
        input: "Hello world",
        expectedOutput: "c8302c9634c1da42",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, "ThiskeyisexactlythirtytwoByteslo"] }
        ]
    },
    {
        name: "BLAKE3: 16390 - test",
        input: "test",
        expectedMatch: /4878.{32760}555fe06b242738d5/,
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [16390, ""] }
        ]
    },
    {
        name: "BLAKE3: 16390 - key test",
        input: "test",
        expectedMatch: /a8d0.{32760}19ccd9b9726b46ae/,
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [16390, "ThiskeyisexactlythirtytwoBytesLo"] }
        ]
    },
// test vectors from https://github.com/BLAKE3-team/BLAKE3/blob/master/test_vectors/test_vectors.json
    {
        name: "BLAKE3: Std test vector - 0 bytes input, plain hash",
        input: "",
        expectedOutput: "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262e00f03e7b69af26b7faaf09fcd333050338ddfe085b8cc869ca98b206c08243a26f5487789e8f660afe6c99ef9e0c52b92e7393024a80459cf91f476f9ffdbda7001c22e159b402631f277ca96f2defdf1078282314e763699a31c5363165421cce14d",
        recipeConfig: [
            {
                "op": "BLAKE3",
                "args": [131, ""]
            }
        ]
    },
    {
        name: "BLAKE3: Std test vector - 0 bytes input, keyed hash",
        input: "",
        expectedOutput: "92b2b75604ed3c761f9d6f62392c8a9227ad0ea3f09573e783f1498a4ed60d26b18171a2f22a4b94822c701f107153dba24918c4bae4d2945c20ece13387627d3b73cbf97b797d5e59948c7ef788f54372df45e45e4293c7dc18c1d41144a9758be58960856be1eabbe22c2653190de560ca3b2ac4aa692a9210694254c371e851bc8f",
        recipeConfig: [
            {
                "op": "BLAKE3",
                "args": [131, "whats the Elvish word for friend"]
            }
        ]
    },
    {
        name: "BLAKE3: Std test vector - 7 bytes input, keyed hash",
        input: "0001020304050607",
        expectedOutput: "be2f5495c61cba1bb348a34948c004045e3bd4dae8f0fe82bf44d0da245a060048eb5e68ce6dea1eb0229e144f578b3aa7e9f4f85febd135df8525e6fe40c6f0340d13dd09b255ccd5112a94238f2be3c0b5b7ecde06580426a93e0708555a265305abf86d874e34b4995b788e37a823491f25127a502fe0704baa6bfdf04e76c13276",
        recipeConfig: [
            {
                "op": "From Hex",
                args: [],
            },
            {
                "op": "BLAKE3",
                "args": [131, "whats the Elvish word for friend"]
            }
        ]
    },
]);
