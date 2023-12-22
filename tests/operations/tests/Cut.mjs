/**
 * Cut operation tests
 *
 * @author emilhf [emil@cyberops.no]
 *
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract single field",
        input: "test1,test2,test3",
        expectedOutput: "test2",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "1", "\\n", "\\n", ",", ","],
            },
        ],
    },
    {
        name: "Extract range",
        input: "test1,test2,test3",
        expectedOutput: "test2,test3",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "1-2", "\\n", "\\n", ",", ","],
            },
        ],
    },
    {
        name: "Extract reverse range",
        input: "test1,test2,test3",
        expectedOutput: "test2,test1",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "1-0", "\\n", "\\n", ",", ","],
            },
        ],
    },
    {
        name: "Extract multiple ranges",
        input: "test1,test2,test3",
        expectedOutput: "test2,test3,test1",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "1-2,0", "\\n", "\\n", ",", ","],
            },
        ],
    },
    {
        name: "Combine two existing fields",
        input: "john.doe,CONTOSO\nadams,CONTOSO",
        expectedOutput: "john.doe@CONTOSO\nadams@CONTOSO",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "0 \"@\" 1", "\\n", "\\n", ",", ","],
            },
        ],
    },
    {
        name: "Fixed width to CSV",
        input: "abcdefghijklmnopqrstuvxyz",
        expectedOutput: "abc,xyz",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "0-2, 22-24", "\\n", "\\n", "", ","],
            },
        ],
    },
    {
        name: "Extract and convert CSV to TSV",
        input: "ITEM,VALUE\nflamingo,439\nvodka,14",
        expectedOutput: "ITEM\tVALUE\nflamingo\t439\nvodka\t14",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "0-", "\\n", "\\n", ",", "\\t"],
            }
        ],
    },
    {
        name: "Extract with wrong delimiter",
        input: "test1,test2",
        expectedOutput: "test1,test2",
        recipeConfig: [
            {
                op: "Cut",
                args: ["User defined", "0-", "\\n", "\\n", "\\t", ";"],
            },
        ],
    },
]);
