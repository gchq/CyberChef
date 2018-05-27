/**
 * Code tests.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

const JPATH_TEST_DATA = {
    "store": {
        "book": [{
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": 8.95
        }, {
            "category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
        }, {
            "category": "fiction",
            "author": "Herman Melville",
            "title": "Moby Dick",
            "isbn": "0-553-21311-3",
            "price": 8.99
        }, {
            "category": "fiction",
            "author": "J. R. R. Tolkien",
            "title": "The Lord of the Rings",
            "isbn": "0-395-19395-8",
            "price": 22.99
        }],
        "bicycle": {
            "color": "red",
            "price": 19.95
        },
        "newspaper": [{
            "format": "broadsheet",
            "title": "Financial Times",
            "price": 2.75
        }, {
            "format": "tabloid",
            "title": "The Guardian",
            "price": 2.00
        }]
    }
};

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
    {
        name: "JPath Expression: Empty JSON",
        input: "",
        expectedOutput: "Invalid input JSON: Unexpected end of JSON input",
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: Empty expression",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: "Invalid JPath expression: we need a path",
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: Fetch of values from specific object",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "\"Nigel Rees\"",
            "\"Evelyn Waugh\"",
            "\"Herman Melville\"",
            "\"J. R. R. Tolkien\""
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$.store.book[*].author", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: Fetch of all values with matching key",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "\"Sayings of the Century\"",
            "\"Sword of Honour\"",
            "\"Moby Dick\"",
            "\"The Lord of the Rings\"",
            "\"Financial Times\"",
            "\"The Guardian\""
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..title", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: All data in object",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "[{\"category\":\"reference\",\"author\":\"Nigel Rees\",\"title\":\"Sayings of the Century\",\"price\":8.95},{\"category\":\"fiction\",\"author\":\"Evelyn Waugh\",\"title\":\"Sword of Honour\",\"price\":12.99},{\"category\":\"fiction\",\"author\":\"Herman Melville\",\"title\":\"Moby Dick\",\"isbn\":\"0-553-21311-3\",\"price\":8.99},{\"category\":\"fiction\",\"author\":\"J. R. R. Tolkien\",\"title\":\"The Lord of the Rings\",\"isbn\":\"0-395-19395-8\",\"price\":22.99}]",
            "{\"color\":\"red\",\"price\":19.95}",
            "[{\"format\":\"broadsheet\",\"title\":\"Financial Times\",\"price\":2.75},{\"format\":\"tabloid\",\"title\":\"The Guardian\",\"price\":2}]"
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$.store.*", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: Last element in array",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: "{\"category\":\"fiction\",\"author\":\"J. R. R. Tolkien\",\"title\":\"The Lord of the Rings\",\"isbn\":\"0-395-19395-8\",\"price\":22.99}",
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..book[-1:]", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: First 2 elements in array",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "{\"category\":\"reference\",\"author\":\"Nigel Rees\",\"title\":\"Sayings of the Century\",\"price\":8.95}",
            "{\"category\":\"fiction\",\"author\":\"Evelyn Waugh\",\"title\":\"Sword of Honour\",\"price\":12.99}"
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..book[:2]", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: All elements in array with property",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "{\"category\":\"fiction\",\"author\":\"Herman Melville\",\"title\":\"Moby Dick\",\"isbn\":\"0-553-21311-3\",\"price\":8.99}",
            "{\"category\":\"fiction\",\"author\":\"J. R. R. Tolkien\",\"title\":\"The Lord of the Rings\",\"isbn\":\"0-395-19395-8\",\"price\":22.99}"
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..book[?(@.isbn)]", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: All elements in array which meet condition",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "{\"category\":\"fiction\",\"author\":\"Evelyn Waugh\",\"title\":\"Sword of Honour\",\"price\":12.99}",
            "{\"category\":\"fiction\",\"author\":\"Herman Melville\",\"title\":\"Moby Dick\",\"isbn\":\"0-553-21311-3\",\"price\":8.99}",
            "{\"category\":\"fiction\",\"author\":\"J. R. R. Tolkien\",\"title\":\"The Lord of the Rings\",\"isbn\":\"0-395-19395-8\",\"price\":22.99}"
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..book[?(@.price<30 && @.category==\"fiction\")]", "\n"]
            }
        ],
    },
    {
        name: "JPath Expression: All elements in object",
        input: JSON.stringify(JPATH_TEST_DATA),
        expectedOutput: [
            "{\"category\":\"reference\",\"author\":\"Nigel Rees\",\"title\":\"Sayings of the Century\",\"price\":8.95}",
            "{\"category\":\"fiction\",\"author\":\"Herman Melville\",\"title\":\"Moby Dick\",\"isbn\":\"0-553-21311-3\",\"price\":8.99}"
        ].join("\n"),
        recipeConfig: [
            {
                "op": "JPath expression",
                "args": ["$..book[?(@.price<10)]", "\n"]
            }
        ],
    },
    /* Since we don't pack ops before running tests, there's no polyfill for DomParser()
    {
        name: "CSS selector",
        input: '<div id="test">\n<p class="a">hello</p>\n<p>world</p>\n<p class="a">again</p>\n</div>',
        expectedOutput: '<p class="a">hello</p>\n<p class="a">again</p>',
        recipeConfig: [
            {
                "op": "CSS selector",
                "args": ["#test p.a", "\\n"]
            }
        ]
    },
    {
        name: "XPath expression",
        input: '<div id="test">\n<p class="a">hello</p>\n<p>world</p>\n<p class="a">again</p>\n</div>',
        expectedOutput: '<p class="a">hello</p>\n<p class="a">again</p>',
        recipeConfig: [
            {
                "op": "XPath expression",
                "args": ["/div/p[@class=\"a\"]", "\\n"]
            }
        ]
    }*/
]);
