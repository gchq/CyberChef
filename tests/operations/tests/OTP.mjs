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
]);
