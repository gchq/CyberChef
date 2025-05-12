/**
 * @author sw5678
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Word Count: Empty test 1",
        "input": "",
        "expectedOutput": "WORD,COUNT\nTOTAL,0",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", true, "Alphabetical"],
            },
        ],
    },
    {
        "name": "Word Count: Empty test 2",
        "input": "",
        "expectedOutput": "WORD,COUNT\nTOTAL,0",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", true, "Count"],
            },
        ],
    },
    {
        "name": "Word Count: Empty test 3",
        "input": "",
        "expectedOutput": "WORD,COUNT\n",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", false, "Alphabetical"],
            },
        ],
    },
    {
        "name": "Word Count: Empty test 4",
        "input": "",
        "expectedOutput": "WORD,COUNT\n",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", false, "Count"],
            },
        ],
    },
    {
        "name": "Word Count: Count test 1",
        "input": "Hello world. Hello. \n\n World, ''!@£$%^&*()_+=-[]{};'|:/.,<>? world",
        "expectedOutput": "WORD,COUNT\nhello,2\nworld,3\nTOTAL,5",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", true, "Alphabetical"],
            },
        ],
    },
    {
        "name": "Word Count: Count test 2",
        "input": "Hello world. Hello. \n\n World, ''!@£$%^&*()_+=-[]{};'|:/.,<>? world",
        "expectedOutput": "WORD,COUNT\nworld,3\nhello,2\nTOTAL,5",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", true, "Count"],
            },
        ],
    },
    {
        "name": "Word Count: Count test 3",
        "input": "Hello world. Hello. \n\n World, ''!@£$%^&*()_+=-[]{};'|:/.,<>? world",
        "expectedOutput": "WORD,COUNT\nhello,2\nworld,3\n",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", false, "Alphabetical"],
            },
        ],
    },
    {
        "name": "Word Count: Count test 4",
        "input": "Hello world. Hello. \n\n World, ''!@£$%^&*()_+=-[]{};'|:/.,<>? world",
        "expectedOutput": "WORD,COUNT\nworld,3\nhello,2\n",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Space", false, "Count"],
            },
        ],
    },
    {
        "name": "Word Count: Different delimiter test",
        "input": "Hello, World\nhello, world \n''!@£$%^&*()_+=-[]{};'|:/.,<>? world",
        "expectedOutput": "WORD,COUNT\nworld,3\nhello,2\n",

        "recipeConfig": [
            {
                "op": "Word Count",
                "args": ["Comma", false, "Count"],
            },
        ],
    }
]);