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
        expectedOutput: `URI: otpauth://hotp/Account?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&counter=0\n\nPassword: 282760`,
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["Account", 6, 0], // [Name, Code length, Counter]
            },
        ],
    },
    {
        name: "Generate HOTP - empty name rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Name cannot be empty.",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["", 6, 0],
            },
        ],
    },
    {
        name: "Generate HOTP - code length below minimum rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be greater than or equal to 6.",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["Account", -6, 0],
            },
        ],
    },
    {
        name: "Generate HOTP - code length above maximum rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be less than or equal to 8.",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["Account", 9, 0],
            },
        ],
    },
    {
        name: "Generate HOTP - non-integer code length rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be an integer.",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["Account", 6.5, 0],
            },
        ],
    },
    {
        name: "Generate HOTP - negative counter rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Counter must be greater than or equal to 0.",
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["Account", 6, -1],
            },
        ],
    },
    {
        name: "Generate HOTP - special characters in name are URI-encoded",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: `URI: otpauth://hotp/user%40example.com?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&counter=0\n\nPassword: 282760`,
        recipeConfig: [
            {
                op: "Generate HOTP",
                args: ["user@example.com", 6, 0],
            },
        ],
    },
    {
        name: "Generate TOTP",
        input: "JBSWY3DPEHPK3PXP",
        expectedMatch: /^URI: otpauth:\/\/totp\/Account\?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30\n\nPassword: \d{6}$/,
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", 6, 0, 30], // [Name, Code length, Epoch offset (T0), Interval (T1)]
            },
        ],
    },
    {
        name: "Generate TOTP - empty name rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Name cannot be empty.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["", 6, 0, 30],
            },
        ],
    },
    {
        name: "Generate TOTP - code length below minimum rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be greater than or equal to 6.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", -6, 0, 30],
            },
        ],
    },
    {
        name: "Generate TOTP - code length above maximum rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be less than or equal to 8.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", 9, 0, 30],
            },
        ],
    },
    {
        name: "Generate TOTP - non-integer code length rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Code length must be an integer.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", 6.5, 0, 30],
            },
        ],
    },
    {
        name: "Generate TOTP - negative interval rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Interval (T1) must be greater than or equal to 1.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", 6, 0, -1],
            },
        ],
    },
    {
        name: "Generate TOTP - negative epoch offset rejected",
        input: "JBSWY3DPEHPK3PXP",
        expectedOutput: "Epoch offset (T0) must be greater than or equal to 0.",
        recipeConfig: [
            {
                op: "Generate TOTP",
                args: ["Account", 6, -1, 30],
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
                args: ["Account", 6, 0],
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
                args: ["Account", 6, 0, 30],
            },
        ],
    },
]);
