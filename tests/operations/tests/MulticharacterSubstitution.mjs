/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Multi-character Substitution: number words",
        "input": "threeseventwofiveninezero",
        "expectedOutput": "372590",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: two letters",
        "input": "thsetwfinize",
        "expectedOutput": "372590",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Two-letter number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: three letters",
        "input": "thrsevtwofivninzer",
        "expectedOutput": "372590",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Three-letter number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: all numbers",
        "input": "zero one two three four five six seven eight nine",
        "expectedOutput": "0 1 2 3 4 5 6 7 8 9",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: longest match",
        "input": "ababa",
        "expectedOutput": "Xba",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"ab\":\"Y\",\"aba\":\"X\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: non-cascading",
        "input": "abc",
        "expectedOutput": "bcX",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"a\":\"b\",\"b\":\"c\",\"c\":\"X\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: literal punctuation",
        "input": "[a].* (b) [a]",
        "expectedOutput": "X Y X",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"[a]\":\"X\",\"(b)\":\"Y\",\".*\":\"\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: replacement syntax stays literal",
        "input": "a",
        "expectedOutput": "$$ $& $1",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"a\":\"$$ $& $1\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: empty replacement",
        "input": "bananas",
        "expectedOutput": "bs",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"anana\":\"\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"one\":\"1\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: empty dictionary",
        "input": "unchanged",
        "expectedOutput": "unchanged",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: case sensitive",
        "input": "ONE one",
        "expectedOutput": "ONE 1",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: Unicode",
        "input": "🙂🙂é",
        "expectedOutput": "AB",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"🙂🙂\":\"A\",\"é\":\"B\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: prototype keys",
        "input": "__proto__ constructor toString",
        "expectedOutput": "ABC",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"__proto__\":\"A\",\" constructor \":\"B\",\"toString\":\"C\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: newlines and tabs",
        "input": "one\ntwo\tthree",
        "expectedOutput": "1\n2\t3",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Number words",
                    "{}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: preset ignores custom dictionary",
        "input": "one",
        "expectedOutput": "1",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Number words",
                    "{"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid dictionary {",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid dictionary null",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "null"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid dictionary []",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "[]"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid dictionary \"text\"",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "\"text\""
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid dictionary 12",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "12"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid mapping {\"\":\"x\"}",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"\":\"x\"}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid mapping {\"x\":1}",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"x\":1}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid mapping {\"x\":null}",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"x\":null}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: invalid mapping {\"x\":{}}",
        "input": "x",
        "expectedOutput": "Custom dictionary must be a JSON object mapping non-empty strings to strings.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    "{\"x\":{}}"
                ]
            }
        ]
    },
    {
        "name": "Multi-character Substitution: bounded dictionary",
        "input": "x",
        "expectedOutput": "Custom dictionary must be at most 65536 characters.",
        "recipeConfig": [
            {
                "op": "Multi-character Substitution",
                "args": [
                    "Custom",
                    " ".repeat(65537)
                ]
            }
        ]
    }
]);
