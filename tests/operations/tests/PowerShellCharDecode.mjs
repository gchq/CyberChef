/**
 * PowerShell Char Decode tests
 *
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "PowerShell Char Decode: decimal single char",
        "input": "[char]65",
        "expectedOutput": "A",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: hex single char",
        "input": "[char]0x41",
        "expectedOutput": "A",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: [System.Char] form",
        "input": "[System.Char]65",
        "expectedOutput": "A",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: char array — IEX",
        "input": "[char[]](73,69,88)",
        "expectedOutput": "\"IEX\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: -join char array — IEX",
        "input": "-join [char[]](73,69,88)",
        "expectedOutput": "\"IEX\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: char array with hex values",
        "input": "[char[]](0x49,0x45,0x58)",
        "expectedOutput": "\"IEX\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: char array — New-Object",
        "input": "[char[]](78,101,119,45,79,98,106,101,99,116)",
        "expectedOutput": "\"New-Object\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: multiple single casts in one line",
        "input": "[char]73 + [char]69 + [char]88",
        "expectedOutput": "I + E + X",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: char cast embedded in script",
        "input": "$cmd = [char[]](73,69,88); & $cmd $payload",
        "expectedOutput": "$cmd = \"IEX\"; & $cmd $payload",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: null character",
        "input": "[char]0",
        "expectedOutput": "\x00",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: space character",
        "input": "[char]32",
        "expectedOutput": " ",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: no [char] casts — passthrough",
        "input": "Invoke-Expression $cmd",
        "expectedOutput": "Invoke-Expression $cmd",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: mixed case [Char]",
        "input": "[Char]65",
        "expectedOutput": "A",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: char array with spaces after commas",
        "input": "[char[]](73, 69, 88)",
        "expectedOutput": "\"IEX\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: ieX via hex char array (Hatching.io sample)",
        "input": "[char[]](0x69,0x65,0x58)",
        "expectedOutput": "\"ieX\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: Write-Output cmdlet via decimal char array",
        "input": "[char[]](87,114,105,116,101,45,79,117,116,112,117,116)",
        "expectedOutput": "\"Write-Output\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: AmsiUtils via decimal char array",
        "input": "[char[]](65,109,115,105,85,116,105,108,115)",
        "expectedOutput": "\"AmsiUtils\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: Get-Process via hex char array",
        "input": "[char[]](0x47,0x65,0x74,0x2d,0x50,0x72,0x6f,0x63,0x65,0x73,0x73)",
        "expectedOutput": "\"Get-Process\"",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: Invoke-Expression embedded in script",
        "input": "$c = [char[]](73,110,118,111,107,101,45,69,120,112,114,101,115,115,105,111,110); & $c",
        "expectedOutput": "$c = \"Invoke-Expression\"; & $c",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    },
    {
        "name": "PowerShell Char Decode: out-of-range value left unchanged",
        "input": "[char]99999",
        "expectedOutput": "[char]99999",
        "recipeConfig": [{ "op": "PowerShell Char Decode", "args": [] }]
    }
]);
