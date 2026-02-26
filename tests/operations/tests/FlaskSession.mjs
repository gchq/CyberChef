/**
 * Flask Session tests
 *
 * @author ThePlayer372-FR []
 *
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const validToken = "eyJyb2xlIjoic3VwZXJ1c2VyIiwidXNlciI6ImFkbWluIn0.aZ-KEw.E_x6bOhA4GU9t72pMinJUjN-O3I";
const validKey = "mysecretkey";
const outputObject = {
    user: "admin",
    role: "superuser",
}

const outputVerify = {
    valid: true,
    payload: outputObject,
}

TestRegister.addTests([
    {
        name: "Flask Session: Decode",
        input: validToken,
        expectedOutput: outputObject,
        recipeConfig: [
            {
                op: "Flask Session Decode",
                args: [],
            }
        ]
    },
    {
        name: "Flask Session: Verify",
        input: validToken,
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
                    "sha1"
                ],
            }
        ]
    },
])