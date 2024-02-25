/**
 * Fernet tests.
 *
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Fernet Decrypt: no input",
        input: "",
        expectedOutput: "Error: Invalid version",
        recipeConfig: [
            {
                op: "Fernet Decrypt",
                args: ["MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="]
            }
        ],
    },
    {
        name: "Fernet Decrypt: no secret",
        input: "gAAAAABce-Tycae8klRxhDX2uenJ-uwV8-A1XZ2HRnfOXlNzkKKfRxviNLlgtemhT_fd1Fw5P_zFUAjd69zaJBQyWppAxVV00SExe77ql8c5n62HYJOnoIU=",
        expectedOutput: "Error: Secret must be 32 url-safe base64-encoded bytes.",
        recipeConfig: [
            {
                op: "Fernet Decrypt",
                args: [""]
            }
        ],
    },
    {
        name: "Fernet Decrypt: valid arguments",
        input: "gAAAAABce-Tycae8klRxhDX2uenJ-uwV8-A1XZ2HRnfOXlNzkKKfRxviNLlgtemhT_fd1Fw5P_zFUAjd69zaJBQyWppAxVV00SExe77ql8c5n62HYJOnoIU=",
        expectedOutput: "This is a secret message.\n",
        recipeConfig: [
            {
                op: "Fernet Decrypt",
                args: ["VGhpc0lzVGhpcnR5VHdvQ2hhcmFjdGVyc0xvbmdLZXk="]
            }
        ],
    }
]);

TestRegister.addTests([
    {
        name: "Fernet Encrypt: no input",
        input: "",
        expectedMatch: /^gAAAAABce-[\w-]+={0,2}$/,
        recipeConfig: [
            {
                op: "Fernet Encrypt",
                args: ["MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="]
            }
        ],
    },
    {
        name: "Fernet Encrypt: no secret",
        input: "This is a secret message.\n",
        expectedOutput: "Error: Secret must be 32 url-safe base64-encoded bytes.",
        recipeConfig: [
            {
                op: "Fernet Encrypt",
                args: [""]
            }
        ],
    },
    {
        name: "Fernet Encrypt: valid arguments",
        input: "This is a secret message.\n",
        expectedMatch: /^gAAAAABce-[\w-]+={0,2}$/,
        recipeConfig: [
            {
                op: "Fernet Encrypt",
                args: ["MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="]
            }
        ],
    }
]);
