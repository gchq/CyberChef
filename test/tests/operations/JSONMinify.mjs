/**
 * JSONMinify tests.
 *
 * @author Phillip Nordwall [Phillip.Nordwall@gmail.com]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "JSON Minify: ''",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: number",
        input: "42",
        expectedOutput: "42",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: number",
        input: "4.2",
        expectedOutput: "4.2",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: string",
        input: "\"string\"",
        expectedOutput: "\"string\"",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: boolean",
        input: "false",
        expectedOutput: "false",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: emptyList",
        input: "[\n \n  \t]",
        expectedOutput: "[]",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: list",
        input: "[2,\n  \t1]",
        expectedOutput: "[2,1]",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: object",
        input: "{\n \"second\": 2,\n \"first\": 3\n}",
        expectedOutput: "{\"second\":2,\"first\":3}",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "JSON Minify: tab, nested",
        input: "[\n\t2,\n\t{\n\t\t\"second\": 2,\n\t\t\"first\": 3,\n\t\t\"beginning\": {\n\t\t\t\"j\": \"3\",\n\t\t\t\"i\": [\n\t\t\t\t2,\n\t\t\t\t3,\n\t\t\t\tfalse\n\t\t\t]\n\t\t}\n\t},\n\t1,\n\t2,\n\t3\n]",
        expectedOutput: "[2,{\"second\":2,\"first\":3,\"beginning\":{\"j\":\"3\",\"i\":[2,3,false]}},1,2,3]",
        recipeConfig: [
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
]);
