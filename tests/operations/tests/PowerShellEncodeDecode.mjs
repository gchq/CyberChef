/**
 * PowerShell -e Encode/Decode tests.
 *
 * @author neoreo
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "PowerShell -e Encode/Decode: encode nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Encode"],
            },
        ],
    },
    {
        name: "PowerShell -e Encode/Decode: encode whoami",
        input: "whoami",
        expectedOutput: "dwBoAG8AYQBtAGkA",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Encode"],
            },
        ],
    },
    {
        name: "PowerShell -e Encode/Decode: decode whoami",
        input: "dwBoAG8AYQBtAGkA",
        expectedOutput: "whoami",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Decode"],
            },
        ],
    },
    {
        name: "PowerShell -e Encode/Decode: round trip",
        input: "Get-Process | Where-Object {$_.CPU -gt 10}",
        expectedOutput: "Get-Process | Where-Object {$_.CPU -gt 10}",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Encode"],
            },
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Decode"],
            },
        ],
    },
    {
        name: "PowerShell -e Encode/Decode: round trip with non-ASCII characters",
        input: "Write-Host \"café ☕\"",
        expectedOutput: "Write-Host \"café ☕\"",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Encode"],
            },
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Decode"],
            },
        ],
    },
    {
        name: "PowerShell -e Encode/Decode: decode ignores characters outside the Base64 alphabet",
        input: "!!!@@@###",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "PowerShell -e Encode/Decode",
                args: ["Decode"],
            },
        ],
    },
]);
