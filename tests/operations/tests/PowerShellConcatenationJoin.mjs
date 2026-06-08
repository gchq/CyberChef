/**
 * PowerShell Concatenation Join tests
 *
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "PowerShell Concatenation Join: two single-quoted fragments",
        "input": "'Invoke' + '-Item'",
        "expectedOutput": "'Invoke-Item'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: two double-quoted fragments",
        "input": "\"Invoke\" + \"-Expression\"",
        "expectedOutput": "\"Invoke-Expression\"",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: three-fragment chain",
        "input": "'In' + 'vo' + 'ke-Item'",
        "expectedOutput": "'Invoke-Item'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: five-fragment chain",
        "input": "'In' + 'v' + 'ok' + 'e-' + 'Item'",
        "expectedOutput": "'Invoke-Item'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: mixed single + double quotes",
        "input": "\"New-\" + 'Object'",
        "expectedOutput": "\"New-Object\"",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: mixed double + single quotes",
        "input": "'New-' + \"Object\"",
        "expectedOutput": "'New-Object'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: embedded in a script",
        "input": "$x = 'Do' + 'wn' + 'load' + 'File'\n$y = 'normal'",
        "expectedOutput": "$x = 'DownloadFile'\n$y = 'normal'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: multiple independent concatenations on same line",
        "input": "('Ne' + 'w-' + 'Ob' + 'ject') ('Do' + 'wn' + 'load' + 'File')",
        "expectedOutput": "('New-Object') ('DownloadFile')",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: no concatenation — passthrough",
        "input": "$x = 'Invoke-Expression'",
        "expectedOutput": "$x = 'Invoke-Expression'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: variable operand left untouched",
        "input": "'Invoke-' + $suffix",
        "expectedOutput": "'Invoke-' + $suffix",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: spaces inside strings preserved",
        "input": "'Net.' + 'Web' + 'Client'",
        "expectedOutput": "'Net.WebClient'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: extra whitespace around plus",
        "input": "'foo'  +  'bar'",
        "expectedOutput": "'foobar'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: IEX AMSI bypass pattern",
        "input": "$a = 'Am' + 'si' + 'Ut' + 'ils'",
        "expectedOutput": "$a = 'AmsiUtils'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: Emotet-style URL split",
        "input": "'h' + 'tt' + 'p://' + '192' + '.168' + '.1' + '.71' + '/hello.ps1'",
        "expectedOutput": "'http://192.168.1.71/hello.ps1'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: DownloadFile method name split",
        "input": "'Down' + 'load' + 'File'",
        "expectedOutput": "'DownloadFile'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: IEX single-char split",
        "input": "'I' + 'E' + 'X'",
        "expectedOutput": "'IEX'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    },
    {
        "name": "PowerShell Concatenation Join: Set-StrictMode split",
        "input": "'Se' + 't-' + 'St' + 'ric' + 'tMo' + 'de'",
        "expectedOutput": "'Set-StrictMode'",
        "recipeConfig": [{ "op": "PowerShell Concatenation Join", "args": [] }]
    }
]);
