/**
 * ChaCha20-Poly1305 tests.
 *
 * @author CyberChef Contributors
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "ChaCha20-Poly1305 Encrypt: with AAD",
        input: "48656c6c6f20576f726c6421",
        expectedOutput: "aaf0e531efaf1adc54287bea\n\nTag: a2c7899e3e61c1c4e6ba031e3f43ae22",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Encrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "UTF8", string: "additional data"},
                    "Hex",
                    "Hex"
                ]
            }
        ],
    },
    {
        name: "ChaCha20-Poly1305 Encrypt: no AAD",
        input: "48656c6c6f20576f726c6421",
        expectedOutput: "aaf0e531efaf1adc54287bea\n\nTag: 8601dfc74c5265ba180a0967ff5e3537",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Encrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "Hex", string: ""},
                    "Hex",
                    "Hex"
                ]
            }
        ],
    },
    {
        name: "ChaCha20-Poly1305 Decrypt: with AAD",
        input: "aaf0e531efaf1adc54287bea",
        expectedOutput: "48656c6c6f20576f726c6421",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Decrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "UTF8", string: "additional data"},
                    {option: "Hex", string: "a2c7899e3e61c1c4e6ba031e3f43ae22"},
                    "Hex",
                    "Hex"
                ]
            }
        ],
    },
    {
        name: "ChaCha20-Poly1305 Decrypt: no AAD",
        input: "aaf0e531efaf1adc54287bea",
        expectedOutput: "48656c6c6f20576f726c6421",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Decrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "Hex", string: ""},
                    {option: "Hex", string: "8601dfc74c5265ba180a0967ff5e3537"},
                    "Hex",
                    "Hex"
                ]
            }
        ],
    },
    {
        name: "ChaCha20-Poly1305 Encrypt: Raw output (regression for Buffer pool leak)",
        input: "Hello World!",
        expectedOutput: "aaf0e531efaf1adc54287bea0a0a5461673a20a2c7899e3e61c1c4e6ba031e3f43ae22",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Encrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "UTF8", string: "additional data"},
                    "Raw",
                    "Raw"
                ]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    },
    {
        name: "ChaCha20-Poly1305 Decrypt: Raw output length (regression for Buffer pool leak)",
        input: "aaf0e531efaf1adc54287bea",
        expectedOutput: "Hello World!",
        recipeConfig: [
            {
                op: "ChaCha20-Poly1305 Decrypt",
                args: [
                    {option: "Hex", string: "0000000000000000000000000000000000000000000000000000000000000001"},
                    {option: "Hex", string: "000000000000000000000002"},
                    {option: "UTF8", string: "additional data"},
                    {option: "Hex", string: "a2c7899e3e61c1c4e6ba031e3f43ae22"},
                    "Hex",
                    "Raw"
                ]
            }
        ],
    }
]);
