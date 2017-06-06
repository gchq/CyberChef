/**
 * Code tests.
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "To Camel case (dumb)",
        input: "hello world",
        expectedOutput: "helloWorld",
        recipeConfig: [
            {
                "op": "To Camel case",
                "args": [false]
            }
        ],
    },
    {
        name: "To Snake case (dumb)",
        input: "hello world",
        expectedOutput: "hello_world",
        recipeConfig: [
            {
                "op": "To Snake case",
                "args": [false]
            }
        ],
    },
    {
        name: "To Kebab case (dumb)",
        input: "hello world",
        expectedOutput: "hello-world",
        recipeConfig: [
            {
                "op": "To Kebab case",
                "args": [false]
            }
        ],
    },
    {
        name: "To Camel case (smart)",
        input: [
            "test='hello'",
            "echo $test",
            "a_camel_case_function",
            "$a_camel_case_variable;",
            "function function_name() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        expectedOutput: [
            "test='hello'",
            "echo $test",
            "aCamelCaseFunction",
            "$aCamelCaseVariable;",
            "function functionName() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        recipeConfig: [
            {
                "op": "To Camel case",
                "args": [true]
            }
        ],
    },
    {
        name: "To Snake case (smart)",
        input: [
            "test='hello'",
            "echo $test",
            "aSnakeCaseFunction",
            "$aSnakeCaseVariable;",
            "function functionName() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        expectedOutput: [
            "test='hello'",
            "echo $test",
            "a_snake_case_function",
            "$a_snake_case_variable;",
            "function function_name() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        recipeConfig: [
            {
                "op": "To Snake case",
                "args": [true]
            }
        ],
    },
    {
        name: "To Kebab case (smart)",
        input: [
            "test='hello'",
            "echo $test",
            "aKebabCaseFunction",
            "$aKebabCaseVariable;",
            "function functionName() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        expectedOutput: [
            "test='hello'",
            "echo $test",
            "a-kebab-case-function",
            "$a-kebab-case-variable;",
            "function function-name() {",
            "  console.log('things inside quotes do not get broken');",
            "  console.log(\"things inside quotes do not get broken\");",
            "}",
        ].join("\n"),
        recipeConfig: [
            {
                "op": "To Kebab case",
                "args": [true]
            }
        ],
    },
]);
