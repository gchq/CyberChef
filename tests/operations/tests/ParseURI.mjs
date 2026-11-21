/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Parse URI: default text",
        "input": "https://example.com/path?q=test",
        "expectedOutput": "Protocol:\thttps:\nHostname:\texample.com\nPath name:\t/path\nArguments:\n\tq = test\n",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": []
            }
        ]
    },
    {
        "name": "Parse URI: text repeated parameters",
        "input": "https://example.com/?q=one&q=two",
        "expectedOutput": "Protocol:\thttps:\nHostname:\texample.com\nPath name:\t/\nArguments:\n\tq = one,two\n",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    false
                ]
            }
        ]
    },
    {
        "name": "Parse URI: all URI parts",
        "input": "https://user:pass@example.com:8443/path?q=one#section",
        "expectedOutput": "{\n    \"Protocol\": \"https:\",\n    \"Auth\": \"user:pass\",\n    \"Hostname\": \"example.com\",\n    \"Port\": \"8443\",\n    \"Path name\": \"/path\",\n    \"Arguments\": {\n        \"q\": [\n            \"one\"\n        ]\n    },\n    \"Hash\": \"#section\"\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: repeated parameters",
        "input": "https://example.com/?q=one&q=two&x=3",
        "expectedOutput": "{\n    \"Protocol\": \"https:\",\n    \"Hostname\": \"example.com\",\n    \"Path name\": \"/\",\n    \"Arguments\": {\n        \"q\": [\n            \"one\",\n            \"two\"\n        ],\n        \"x\": [\n            \"3\"\n        ]\n    }\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: empty and escaped values",
        "input": "/search?empty=&flag&q=a+b&q=%26%3D&%E2%9C%93=%F0%9F%99%82",
        "expectedOutput": "{\n    \"Path name\": \"/search\",\n    \"Arguments\": {\n        \"empty\": [\n            \"\"\n        ],\n        \"flag\": [\n            \"\"\n        ],\n        \"q\": [\n            \"a b\",\n            \"&=\"\n        ],\n        \"✓\": [\n            \"🙂\"\n        ]\n    }\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: prototype keys",
        "input": "/?__proto__=a&constructor=b&toString=c&__proto__=d",
        "expectedOutput": "{\n    \"Path name\": \"/\",\n    \"Arguments\": {\n        \"__proto__\": [\n            \"a\",\n            \"d\"\n        ],\n        \"constructor\": [\n            \"b\"\n        ],\n        \"toString\": [\n            \"c\"\n        ]\n    }\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: relative URI",
        "input": "/path#hash",
        "expectedOutput": "{\n    \"Path name\": \"/path\",\n    \"Hash\": \"#hash\"\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: empty URI",
        "input": "",
        "expectedOutput": "{}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: queryless URL",
        "input": "https://example.com",
        "expectedOutput": "{\n    \"Protocol\": \"https:\",\n    \"Hostname\": \"example.com\",\n    \"Path name\": \"/\"\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    },
    {
        "name": "Parse URI: invalid percent escape",
        "input": "/?q=%zz",
        "expectedOutput": "{\n    \"Path name\": \"/\",\n    \"Arguments\": {\n        \"q\": [\n            \"%zz\"\n        ]\n    }\n}",
        "recipeConfig": [
            {
                "op": "Parse URI",
                "args": [
                    true
                ]
            }
        ]
    }
]);
