/**
 * OTP HOTP tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate HOTP",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: `URI: otpauth://hotp/?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&counter=0\n\nPassword: 282760`,
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["", 6, 0], // [Name, Code length, Counter]
            },
        ],
    },
    {
        name: "Generate HOTP - invalid base32 secret rejected",
        input: "not,valid|base32;input",
        expectedOutput: "Invalid secret. The input must be a valid base32 string (characters A–Z and 2–7).",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["", 6, 0],
            },
        ],
    },
    {
        name: "Generate TOTP - invalid base32 secret rejected",
        input: "not,valid|base32;input",
        expectedOutput: "Invalid secret. The input must be a valid base32 string (characters A–Z and 2–7).",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["", 6, 0, 30],
            },
        ],
    },
]);
