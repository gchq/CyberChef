/**
 * Flask Session tests
 *
 * @author ThePlayer372-FR []
 *
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const validTokenSha1 = "eyJyb2xlIjoic3VwZXJ1c2VyIiwidXNlciI6ImFkbWluIn0.aZ-KEw.E_x6bOhA4GU9t72pMinJUjN-O3I";
const validTokenSha256 = "eyJyb2xlIjoic3VwZXJ1c2VyIiwidXNlciI6ImFkbWluIn0.aab3Ew.Jsx2DOx_H9anZg0YcvhsASxQ11897EFHeQfS2oja4y8";

const validKey = "mysecretkey";
const wrongKey = "notTheKey";

const outputObject = {
    user: "admin",
    role: "superuser",
};

const outputVerify = {
    valid: true,
    payload: outputObject,
};

TestRegister.addTests([
    {
        name: "Flask Session: Decode",
        input: validTokenSha1,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "Flask Session Decode",
                args: [
                    false
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha1",
        input: validTokenSha1,
        expectedOutput: outputVerify,
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha1",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha256",
        input: validTokenSha256,
        expectedOutput: outputVerify,
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha256",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Sign Sha1",
        input: outputObject,
        expectedOutput: outputVerify,
        recipeConfig: [
            {
                op: "Flask Session Sign",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha1"
                ]
            },
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha1",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Sign Sha256",
        input: outputObject,
        expectedOutput: outputVerify,
        recipeConfig: [
            {
                op: "Flask Session Sign",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha256"
                ]
            },
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha256",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha1 Wrong Key",
        input: validTokenSha1,
        expectedOutput: "Invalid signature!",
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: wrongKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha1",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha256 Wrong Key",
        input: validTokenSha256,
        expectedOutput: "Invalid signature!",
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: wrongKey,
                        option: "UTF8"
                    },
                    {
                        string: "cookie-session",
                        option: "UTF8"
                    },
                    "sha256",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha1 Wrong Salt",
        input: validTokenSha1,
        expectedOutput: "Invalid signature!",
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "notTheSalt",
                        option: "UTF8"
                    },
                    "sha1",
                    false,
                ],
            }
        ]
    },
    {
        name: "Flask Session: Verify Sha256 Wrong Salt",
        input: validTokenSha256,
        expectedOutput: "Invalid signature!",
        recipeConfig: [
            {
                op: "Flask Session Verify",
                args: [
                    {
                        string: validKey,
                        option: "UTF8"
                    },
                    {
                        string: "notTheSalt",
                        option: "UTF8"
                    },
                    "sha256",
                    false,
                ],
            }
        ]
    },

]);
