/**
 * Code tests.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

const JSON_TEST_DATA = {
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
        input: JSON.stringify(JSON_TEST_DATA),
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
    },
    {
        name: "To MessagePack: no content",
        input: "",
        expectedMatch: /Unexpected end of JSON input/,
        recipeConfig: [
            {
                "op": "To MessagePack",
                "args": []
            }
        ]
    },
    {
        name: "From MessagePack: no content",
        input: "",
        expectedOutput: "Could not decode MessagePack to JSON: Error: Could not parse",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "From MessagePack",
                "args": []
            }
        ]
    },
    {
        name: "To MessagePack: valid json",
        input: JSON.stringify(JSON_TEST_DATA),
        expectedOutput: "81 a5 73 74 6f 72 65 83 a4 62 6f 6f 6b 94 84 a8 63 61 74 65 67 6f 72 79 a9 72 65 66 65 72 65 6e 63 65 a6 61 75 74 68 6f 72 aa 4e 69 67 65 6c 20 52 65 65 73 a5 74 69 74 6c 65 b6 53 61 79 69 6e 67 73 20 6f 66 20 74 68 65 20 43 65 6e 74 75 72 79 a5 70 72 69 63 65 cb 40 21 e6 66 66 66 66 66 84 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 ac 45 76 65 6c 79 6e 20 57 61 75 67 68 a5 74 69 74 6c 65 af 53 77 6f 72 64 20 6f 66 20 48 6f 6e 6f 75 72 a5 70 72 69 63 65 cb 40 29 fa e1 47 ae 14 7b 85 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 af 48 65 72 6d 61 6e 20 4d 65 6c 76 69 6c 6c 65 a5 74 69 74 6c 65 a9 4d 6f 62 79 20 44 69 63 6b a4 69 73 62 6e ad 30 2d 35 35 33 2d 32 31 33 31 31 2d 33 a5 70 72 69 63 65 cb 40 21 fa e1 47 ae 14 7b 85 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 b0 4a 2e 20 52 2e 20 52 2e 20 54 6f 6c 6b 69 65 6e a5 74 69 74 6c 65 b5 54 68 65 20 4c 6f 72 64 20 6f 66 20 74 68 65 20 52 69 6e 67 73 a4 69 73 62 6e ad 30 2d 33 39 35 2d 31 39 33 39 35 2d 38 a5 70 72 69 63 65 cb 40 36 fd 70 a3 d7 0a 3d a7 62 69 63 79 63 6c 65 82 a5 63 6f 6c 6f 72 a3 72 65 64 a5 70 72 69 63 65 cb 40 33 f3 33 33 33 33 33 a9 6e 65 77 73 70 61 70 65 72 92 83 a6 66 6f 72 6d 61 74 aa 62 72 6f 61 64 73 68 65 65 74 a5 74 69 74 6c 65 af 46 69 6e 61 6e 63 69 61 6c 20 54 69 6d 65 73 a5 70 72 69 63 65 cb 40 06 00 00 00 00 00 00 83 a6 66 6f 72 6d 61 74 a7 74 61 62 6c 6f 69 64 a5 74 69 74 6c 65 ac 54 68 65 20 47 75 61 72 64 69 61 6e a5 70 72 69 63 65 02",
        recipeConfig: [
            {
                "op": "To MessagePack",
                "args": []
            },
            {
                "op": "To Hex",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "From MessagePack: valid msgpack",
        input: "81 a5 73 74 6f 72 65 83 a4 62 6f 6f 6b 94 84 a8 63 61 74 65 67 6f 72 79 a9 72 65 66 65 72 65 6e 63 65 a6 61 75 74 68 6f 72 aa 4e 69 67 65 6c 20 52 65 65 73 a5 74 69 74 6c 65 b6 53 61 79 69 6e 67 73 20 6f 66 20 74 68 65 20 43 65 6e 74 75 72 79 a5 70 72 69 63 65 cb 40 21 e6 66 66 66 66 66 84 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 ac 45 76 65 6c 79 6e 20 57 61 75 67 68 a5 74 69 74 6c 65 af 53 77 6f 72 64 20 6f 66 20 48 6f 6e 6f 75 72 a5 70 72 69 63 65 cb 40 29 fa e1 47 ae 14 7b 85 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 af 48 65 72 6d 61 6e 20 4d 65 6c 76 69 6c 6c 65 a5 74 69 74 6c 65 a9 4d 6f 62 79 20 44 69 63 6b a4 69 73 62 6e ad 30 2d 35 35 33 2d 32 31 33 31 31 2d 33 a5 70 72 69 63 65 cb 40 21 fa e1 47 ae 14 7b 85 a8 63 61 74 65 67 6f 72 79 a7 66 69 63 74 69 6f 6e a6 61 75 74 68 6f 72 b0 4a 2e 20 52 2e 20 52 2e 20 54 6f 6c 6b 69 65 6e a5 74 69 74 6c 65 b5 54 68 65 20 4c 6f 72 64 20 6f 66 20 74 68 65 20 52 69 6e 67 73 a4 69 73 62 6e ad 30 2d 33 39 35 2d 31 39 33 39 35 2d 38 a5 70 72 69 63 65 cb 40 36 fd 70 a3 d7 0a 3d a7 62 69 63 79 63 6c 65 82 a5 63 6f 6c 6f 72 a3 72 65 64 a5 70 72 69 63 65 cb 40 33 f3 33 33 33 33 33 a9 6e 65 77 73 70 61 70 65 72 92 83 a6 66 6f 72 6d 61 74 aa 62 72 6f 61 64 73 68 65 65 74 a5 74 69 74 6c 65 af 46 69 6e 61 6e 63 69 61 6c 20 54 69 6d 65 73 a5 70 72 69 63 65 cb 40 06 00 00 00 00 00 00 83 a6 66 6f 72 6d 61 74 a7 74 61 62 6c 6f 69 64 a5 74 69 74 6c 65 ac 54 68 65 20 47 75 61 72 64 69 61 6e a5 70 72 69 63 65 02",
        expectedOutput: JSON.stringify(JSON_TEST_DATA, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "From MessagePack",
                "args": []
            }
        ]
    }
]);
