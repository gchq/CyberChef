/**
 * PowerShell Decode EncodedCommand tests
 *
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "PowerShell Decode EncodedCommand: raw Base64 only",
        "input": "SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: -enc prefix",
        "input": "-enc SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: -EncodedCommand prefix",
        "input": "-EncodedCommand SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: full powershell invocation with flags",
        "input": "powershell.exe -w 1 -nop -ep bypass -enc SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: pwsh with hidden window",
        "input": "pwsh -WindowStyle hidden -NonInteractive -enc SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: Get-Process command",
        "input": "RwBlAHQALQBQAHIAbwBjAGUAcwBzAA==",
        "expectedOutput": "Get-Process",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: Invoke-Expression command",
        "input": "-enc SQBuAHYAbwBrAGUALQBFAHgAcAByAGUAcwBzAGkAbwBuAA==",
        "expectedOutput": "Invoke-Expression",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: multi-word command",
        "input": "powershell -enc TgBlAHcALQBPAGIAagBlAGMAdAAgAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQA",
        "expectedOutput": "New-Object Net.WebClient",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: -e abbreviation",
        "input": "-e SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: mixed-case flag",
        "input": "-Enc SQBFAFgA",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: whoami recon command",
        "input": "dwBoAG8AYQBtAGkA",
        "expectedOutput": "whoami",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: Set-ExecutionPolicy Bypass preamble",
        "input": "UwBlAHQALQBFAHgAZQBjAHUAdABpAG8AbgBQAG8AbABpAGMAeQAgAEIAeQBwAGEAcwBzACAALQBTAGMAbwBwAGUAIABQAHIAbwBjAGUAcwBzACAALQBGAG8AcgBjAGUA",
        "expectedOutput": "Set-ExecutionPolicy Bypass -Scope Process -Force",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: full cmdline with -nop -w hidden flags",
        "input": "powershell.exe -nop -w hidden -noni -enc RwBlAHQALQBQAHIAbwBjAGUAcwBzAA==",
        "expectedOutput": "Get-Process",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: -ec abbreviated flag",
        "input": "-ec JABlAG4AdgA6AEMATwBNAFAAVQBUAEUAUgBOAEEATQBFAA==",
        "expectedOutput": "$env:COMPUTERNAME",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    },
    {
        "name": "PowerShell Decode EncodedCommand: token with surrounding double-quotes stripped",
        "input": "-enc \"RwBlAHQALQBQAHIAbwBjAGUAcwBzAA==\"",
        "expectedOutput": "Get-Process",
        "recipeConfig": [{ "op": "PowerShell Decode EncodedCommand", "args": [] }]
    }
]);
