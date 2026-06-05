/**
 * @author mikecat
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Diff: Show +/- notation - true (Line mode)",
        "input": "line1\nline2\nline3\n\nline1\nline2modified\nline3",
        "expectedOutput": "line1\n-line2\n+line2modified\nline3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    true,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation - false (Line mode)",
        "input": "line1\nline2\nline3\n\nline1\nline2modified\nline3",
        "expectedOutput": "line1\n<del>line2\n</del><ins>line2modified\n</ins>line3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation - with showAdded false (Line mode)",
        "input": "line1\nline2\nline3\n\nline1\nline2modified\nline3",
        "expectedOutput": "line1\n-line2\nline3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    false,
                    true,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation - with showRemoved false (Line mode)",
        "input": "line1\nline2\nline3\n\nline1\nline2modified\nline3",
        "expectedOutput": "line1\n+line2modified\nline3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    false,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation - with showSubtraction true (Line mode)",
        "input": "line1\nline2\nline3\n\nline1\nline2modified\nline3",
        "expectedOutput": "@@ -1,3 +1,3 @@\n-line2\n+line2modified",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    true,
                    true,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation ignored for Character mode",
        "input": "abc\ndef",
        "expectedOutput": "<del>abc</del><ins>def</ins>",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Character",
                    true,
                    true,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation ignored for Word mode",
        "input": "hello world\nhello cruel world",
        "expectedOutput": "hello <ins>cruel </ins>world",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Word",
                    true,
                    true,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Show +/- notation ignored for Sentence mode",
        "input": "Hello world.\nHello there.",
        "expectedOutput": "<del>Hello world.</del><ins>Hello there.</ins>",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Sentence",
                    true,
                    true,
                    false,
                    false,
                    true
                ],
            },
        ],
    },
    {
        "name": "Diff: Character mode basic",
        "input": "abc\nabc",
        "expectedOutput": "abc",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Character",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Character mode with changes",
        "input": "abc\nabcdef",
        "expectedOutput": "abc<ins>def</ins>",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Character",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Word mode basic",
        "input": "hello world\nhello world",
        "expectedOutput": "hello world",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Word",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Word mode with changes",
        "input": "hello world\nhello cruel world",
        "expectedOutput": "hello <ins>cruel </ins>world",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Word",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Line mode basic",
        "input": "line1\nline2\nline3\n\nline1\nline2\nline3",
        "expectedOutput": "line1\nline2\nline3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Line mode with changes",
        "input": "line1\nline2\nline3\n\nline1\nline4\nline3",
        "expectedOutput": "line1\n<del>line2\n</del><ins>line4\n</ins>line3",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n\\n",
                    "Line",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Sentence mode basic",
        "input": "Hello world.\nHello world.",
        "expectedOutput": "Hello world.",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Sentence",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
    {
        "name": "Diff: Sentence mode with changes",
        "input": "Hello world.\nHello there.",
        "expectedOutput": "<del>Hello world.</del><ins>Hello there.</ins>",
        "recipeConfig": [
            {
                "op": "Diff",
                "args": [
                    "\\n",
                    "Sentence",
                    true,
                    true,
                    false,
                    false,
                    false
                ],
            },
        ],
    },
]);
