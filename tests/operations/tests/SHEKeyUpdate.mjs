/**
 * SHE Key Update tests.
 *
 * Test vectors are taken from the AUTOSAR SHE memory update protocol examples.
 *
 * @author MannXo [prmma23@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "SHE Key Update: AUTOSAR example (basic SHE)",
        input: "0f0e0d0c0b0a09080706050403020100",
        expectedOutput: [
            "M1: 00000000000000000000000000000141",
            "M2: 2b111e2d93f486566bcbba1d7f7a9797c94643b050fc5d4d7de14cff682203c3",
            "M3: b9d745e5ace7d41860bc63c2b9f5bb46",
            "M4: 00000000000000000000000000000141b472e8d8727d70d57295e74849a27917",
            "M5: 820d8d95dc11b4668878160cb2a4e23e",
        ].join("\n"),
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "000000000000000000000000000001"},
                    "KEY_1",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE",
                    false, false, false, false, false, false
                ]
            }
        ]
    },
    {
        name: "SHE Key Update: AUTOSAR example with KEY_USAGE flag (basic SHE)",
        input: "0f0e0d0c0b0a09080706050403020100",
        expectedOutput: [
            "M1: 00000000000000000000000000000011",
            "M2: 74c3a812bf192a6b52d89d79d9b04ac87f19526c70790d7fcdb707a77dfdf5a8",
            "M3: 70c1ebfa56bc2fffff1c9f33048fc294",
            "M4: 00000000000000000000000000000011b472e8d8727d70d57295e74849a27917",
            "M5: ec4a8474b925eaae19feef74620fad7f",
        ].join("\n"),
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "000000000000000000000000000000"},
                    "MASTER_ECU_KEY",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE",
                    false, false, false, true, false, false
                ]
            }
        ]
    },
    {
        name: "SHE Key Update: AUTOSAR example (SHE+ constants)",
        input: "0f0e0d0c0b0a09080706050403020100",
        expectedOutput: [
            "M1: 00000000000000000000000000000141",
            "M2: a6c4d8f632faed103d8e3eef2b7694a92b214b1efad16a4c32964afa37ddadef",
            "M3: 22eb8f2385cb16a0082aabc106b7dbc6",
            "M4: 00000000000000000000000000000141b059c21adbcb938000c9805434852637",
            "M5: e3073b876fa53173da072802bd2c8871",
        ].join("\n"),
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "000000000000000000000000000001"},
                    "KEY_1",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE+",
                    false, false, false, false, false, false
                ]
            }
        ]
    },
    {
        name: "SHE Key Update: rejects the verify only flag under standard SHE",
        input: "0f0e0d0c0b0a09080706050403020100",
        expectedOutput: "The 'Verify only (SHE+)' flag requires the SHE+ variant (FID is 5 bits in SHE)",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "000000000000000000000000000001"},
                    "KEY_1",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE",
                    false, false, false, false, false, true
                ]
            }
        ]
    },
    {
        name: "SHE Key Update: rejects a new key that is not 16 bytes",
        input: "0f0e0d0c0b0a0908070605040302",
        expectedOutput: "The new key (input) must be 16 bytes (currently 14 bytes)",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "000000000000000000000000000001"},
                    "KEY_1",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE",
                    false, false, false, false, false, false
                ]
            }
        ]
    },
    {
        name: "SHE Key Update: rejects a UID that is not 15 bytes",
        input: "0f0e0d0c0b0a09080706050403020100",
        expectedOutput: "The UID must be 15 bytes (currently 14 bytes)",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "SHE Key Update",
                args: [
                    {option: "Hex", string: "000102030405060708090a0b0c0d0e0f"},
                    {option: "Hex", string: "0000000000000000000000000000"},
                    "KEY_1",
                    "MASTER_ECU_KEY",
                    1,
                    "SHE",
                    false, false, false, false, false, false
                ]
            }
        ]
    }
]);
