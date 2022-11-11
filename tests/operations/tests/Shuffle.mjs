/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Shuffle empty",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Shuffle",
                "args": ["Character"]
            }
        ]
    },
    {
        "name": "Shuffle bytes",
        "input": "12345678",
        "expectedOutput": "31 32 33 34 35 36 37 38",
        "recipeConfig": [
            {
                "op": "Shuffle",
                "args": ["Byte"]
            },
            {
                "op": "To Hex",
                "args": ["Space", 0]
            },
            {
                "op": "Sort",
                "args": ["Space", false, "Alphabetical (case sensitive)"]
            }
        ]
    },
    {
        "name": "Shuffle characters",
        "input": "1234\uff15\uff16\uff17\uff18",
        "expectedOutput": " 0031 0032 0033 0034 FF15 FF16 FF17 FF18",
        "recipeConfig": [
            {
                "op": "Shuffle",
                "args": ["Character"]
            },
            {
                "op": "Escape Unicode Characters",
                "args": ["%u", true, 4, true]
            },
            {
                "op": "Split",
                "args": ["%u", " "]
            },
            {
                "op": "Sort",
                "args": ["Space", false, "Alphabetical (case sensitive)"]
            }
        ]
    },
    {
        "name": "Shuffle lines",
        "input": "1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf\n",
        "expectedOutput": "\n1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf",
        "recipeConfig": [
            {
                "op": "Shuffle",
                "args": ["Line"]
            },
            {
                "op": "Sort",
                "args": ["Line feed", false, "Alphabetical (case sensitive)"]
            }
        ]
    },
    {
        "name": "Shuffle lines (last character is not newline)",
        "input": "1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf",
        "expectedOutput": "\n1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf",
        "recipeConfig": [
            {
                "op": "Shuffle",
                "args": ["Line"]
            },
            {
                "op": "Sort",
                "args": ["Line feed", false, "Alphabetical (case sensitive)"]
            }
        ]
    },
]);
