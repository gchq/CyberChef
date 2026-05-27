/**
 * PowerShell Format String Deobfuscate tests
 *
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "PowerShell Format String Deobfuscate: canonical reordered example",
        "input": "(\"{0}{3}{4}{1}{2}\" -f \"S\",\"Mo\",\"de\",\"et-Stri\",\"ct\")",
        "expectedOutput": "Set-StrictMode",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: identity ordering (no scrambling)",
        "input": "(\"{0}{1}{2}\" -f \"New\",\"-\",\"Object\")",
        "expectedOutput": "New-Object",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: single argument",
        "input": "(\"{0}\" -f \"hello\")",
        "expectedOutput": "hello",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: two expressions on the same line",
        "input": "(\"{0}{1}\" -f \"Invoke\",\"-Expression\") + (\"{1}{0}\" -f \"Shell\",\"Power\")",
        "expectedOutput": "Invoke-Expression + PowerShell",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: embedded in a larger script",
        "input": "$x = (\"{1}{0}\" -f \"Object\",\"New-\"); $x.GetType()",
        "expectedOutput": "$x = New-Object; $x.GetType()",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: single-quoted template",
        "input": "('{0}{1}' -f \"foo\",\"bar\")",
        "expectedOutput": "foobar",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: single-quoted arguments",
        "input": "(\"{0}{1}\" -f 'foo','bar')",
        "expectedOutput": "foobar",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: all single quotes",
        "input": "('{1}{0}' -f 'World','Hello')",
        "expectedOutput": "HelloWorld",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: extra whitespace around -f and args",
        "input": "( \"{0}{1}\"  -f  \"abc\" ,  \"def\" )",
        "expectedOutput": "abcdef",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: spaces inside argument values",
        "input": "(\"{0} {1}\" -f \"Hello\",\"World\")",
        "expectedOutput": "Hello World",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: comma inside a quoted argument value",
        "input": "(\"{0}{1}\" -f \"hello, world\",\"!\")",
        "expectedOutput": "hello, world!",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: literal text between placeholders",
        "input": "(\"{0} ran {1}\" -f \"PowerShell\",\"successfully\")",
        "expectedOutput": "PowerShell ran successfully",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: repeated index",
        "input": "(\"{0}{0}{0}\" -f \"abc\")",
        "expectedOutput": "abcabcabc",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: out-of-range index left unchanged",
        "input": "(\"{0}{5}\" -f \"a\",\"b\",\"c\")",
        "expectedOutput": "a{5}",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: no format strings — input passes through unchanged",
        "input": "$x = \"hello\"\nWrite-Host $x",
        "expectedOutput": "$x = \"hello\"\nWrite-Host $x",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: multiline input with expressions on different lines",
        "input": "(\"{1}{0}\" -f \"Object\",\"New-\")\n(\"{0}{1}\" -f \"Invoke\",\"-Expression\")\n$plain = \"untouched\"",
        "expectedOutput": "New-Object\nInvoke-Expression\n$plain = \"untouched\"",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: special characters in arguments (dollar, dot, backslash)",
        "input": "(\"{0}{1}{2}\" -f \"C:\\\\Windows\",\"\\\\\",\"System32\")",
        "expectedOutput": "C:\\\\Windows\\\\System32",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: five-arg scramble (malware-like)",
        "input": "(\"{3}{1}{4}{0}{2}\" -f \"ial\",\"Cred\",\"s\",\"Get-\",\"ent\")",
        "expectedOutput": "Get-Credentials",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: mixed with non-matching parenthetical expressions",
        "input": "if ($x -gt 5) { (\"{1}{0}\" -f \"host\",\"Write-\") }",
        "expectedOutput": "if ($x -gt 5) { Write-host }",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: large index values",
        "input": "(\"{2}{0}{1}\" -f \"b\",\"c\",\"a\")",
        "expectedOutput": "abc",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: single character fragments",
        "input": "(\"{2}{0}{1}\" -f \"e\",\"t\",\"s\")",
        "expectedOutput": "set",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: ten-fragment highly scrambled string",
        "input": "(\"{5}{3}{0}{7}{1}{6}{2}{9}{4}{8}\" -f \"l\",\"o\",\"o\",\"e\",\"l\",\"h\",\"w\",\"l\",\"d\",\"r\")",
        "expectedOutput": "helloworld",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: IEX obfuscation pattern",
        "input": "$cmd = (\"{1}{0}{2}\" -f \"x\",\"IE\",\"\")\n& $cmd (\"{0}{1}\" -f \"Get-\",\"Process\")",
        "expectedOutput": "$cmd = IEx\n& $cmd Get-Process",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },

    // ── OSINT samples from real-world malware ─────────────────────────────────
    // Source: Emotet dropper (Softscheck / gist softSCheck)
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - new-object (single-quoted args, no space before -f)",
        "input": "(\"{0}{2}{1}\" -f'new-ob','t','jec')",
        "expectedOutput": "new-object",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - WScript.Shell (zero spaces around -f)",
        "input": "(\"{0}{1}{2}\"-f'WScrip','t.Shel','l')",
        "expectedOutput": "WScript.Shell",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - DownloadFile (four scrambled fragments)",
        "input": "(\"{0}{3}{1}{2}\"-f'Down','F','ile','load')",
        "expectedOutput": "DownloadFile",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - Start-Process (four fragments)",
        "input": "(\"{0}{2}{1}{3}\" -f 'St','s','art-Proce','s')",
        "expectedOutput": "Start-Process",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - write-host (four scrambled fragments)",
        "input": "(\"{3}{2}{0}{1}\" -f'e-','host','rit','w')",
        "expectedOutput": "write-host",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    {
        "name": "PowerShell Format String Deobfuscate: Emotet - download cradle (two expressions on one line)",
        "input": "$wc = (\"{2}{0}{1}\"-f 'ob','ject','new-'); $wc.(\"{0}{3}{1}{2}\"-f'Down','F','ile','load')($url, $path)",
        "expectedOutput": "$wc = new-object; $wc.DownloadFile($url, $path)",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    // Source: Malicious Word doc (MalSecHunter, 2020)
    {
        "name": "PowerShell Format String Deobfuscate: MalSecHunter 2020 - New-Variable with mixed casing",
        "input": "(\"{1}{3}{0}{2}\" -f 'VaRi','nE','aBlE','w-')",
        "expectedOutput": "nEw-VaRiaBlE",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    // Source: r00t-3xp10it obfuscation guide (GitHub)
    {
        "name": "PowerShell Format String Deobfuscate: r00t-3xp10it - Invoke-Expression (five fragments)",
        "input": "(\"{3}{0}{2}{1}{4}\" -f'voke','es','-Expr','In','sion')",
        "expectedOutput": "Invoke-Expression",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    // Source: ANY.RUN sandbox report (Feb 2019 Excel macro dropper)
    {
        "name": "PowerShell Format String Deobfuscate: ANY.RUN 2019 - ENvIRoNmeNt ([Type] cast target)",
        "input": "(\"{1}{0}{2}\" -f'vI','EN','RoNmeNt')",
        "expectedOutput": "ENvIRoNmeNt",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    },
    // Source: Generic IEX download cradle (common commodity malware pattern)
    {
        "name": "PowerShell Format String Deobfuscate: IEX download cradle (three reconstructed strings)",
        "input": "(\"{1}{0}\" -f 'ex','i') ((\"{2}{0}{1}\" -f '-Ob','ject','New') Net.WebClient).(\"{0}{1}{2}{3}{4}\" -f 'Down','lo','ad','Str','ing')($url)",
        "expectedOutput": "iex (New-Object Net.WebClient).DownloadString($url)",
        "recipeConfig": [{ "op": "PowerShell Format String Deobfuscate", "args": [] }]
    }
]);
