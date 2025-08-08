/**
 * JSONRepair tests.
 *
 * @author maojunxyz [maojun@linux.com]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "JSON Repair: empty string",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: valid JSON unchanged",
        input: '{"name": "John", "age": 30}',
        expectedOutput: '{"name": "John", "age": 30}',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: missing quotes around keys",
        input: '{name: "John", age: 30}',
        expectedOutput: '{"name": "John", "age": 30}',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: single quotes to double quotes",
        input: "{'name': 'John', 'age': 30}",
        expectedOutput: '{"name": "John", "age": 30}',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: trailing comma in object",
        input: '{"name": "John", "age": 30,}',
        expectedOutput: '{"name": "John", "age": 30}',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: trailing comma in array",
        input: '[1, 2, 3,]',
        expectedOutput: '[1, 2, 3]',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: Python constants",
        input: '{"active": True, "data": None, "flag": False}',
        expectedOutput: '{"active": true, "data": null, "flag": false}',
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: line comments",
        input: `{
    "name": "John", // This is a comment
    "age": 30
}`,
        expectedOutput: `{
    "name": "John", 
    "age": 30
}`,
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: block comments",
        input: `{
    "name": "John", /* This is a 
    multi-line comment */
    "age": 30
}`,
        expectedOutput: `{
    "name": "John", 
    "age": 30
}`,
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: missing comma",
        input: `{
    "name": "John"
    "age": 30,
    "city": "Boston"
}`,
        expectedOutput: `{
    "name": "John",
    "age": 30,
    "city": "Boston"
}`,
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
    {
        name: "JSON Repair: complex mixed issues",
        input: `{
    name: 'John',  // Person's name
    age: 30,
    active: True,
    data: None,
}`,
        expectedOutput: `{
    "name": "John",  
    "age": 30,
    "active": true,
    "data": null
}`,
        recipeConfig: [
            {
                op: "JSON Repair",
                args: [],
            },
        ],
    },
]);
