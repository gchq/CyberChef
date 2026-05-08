/**
 * PHP Serialization tests.
 *
 * @author brun0ne [brunonblok@gmail.com]
 *
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "PHP Serialize empty array",
        input: "[]",
        expectedOutput: "a:0:{}",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize empty object",
        input: "{}",
        expectedOutput: "a:0:{}",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize null",
        input: "null",
        expectedOutput: "N;",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize integer",
        input: "10",
        expectedOutput: "i:10;",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize float",
        input: "14.523",
        expectedOutput: "d:14.523;",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize boolean",
        input: "[true, false]",
        expectedOutput: "a:2:{i:0;b:1;i:1;b:0;}",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize string",
        input: "\"Test string to serialize\"",
        expectedOutput: "s:24:\"Test string to serialize\";",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize object",
        input: "{\"a\": 10,\"0\": {\"ab\": true}}",
        expectedOutput: "a:2:{s:1:\"0\";a:1:{s:2:\"ab\";b:1;}s:1:\"a\";i:10;}",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    },
    {
        name: "PHP Serialize array",
        input: "[1,\"abc\",true,{\"x\":1,\"y\":2}]",
        expectedOutput: "a:4:{i:0;i:1;i:1;s:3:\"abc\";i:2;b:1;i:3;a:2:{s:1:\"x\";i:1;s:1:\"y\";i:2;}}",
        recipeConfig: [
            {
                op: "PHP Serialize",
                args: []
            }
        ]
    }
]);
