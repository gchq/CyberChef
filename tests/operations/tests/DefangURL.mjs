/**
 * DefangURL tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Defang URL: Issue 2893",
        input: "https://httpbin.example.com/http/get",
        expectedOutput: "hxxps[://]httpbin[.]example[.]com/http/get",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP scheme",
        input: "http://example.com",
        expectedOutput: "hxxp[://]example[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTPS scheme",
        input: "https://example.com",
        expectedOutput: "hxxps[://]example[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP in hostname",
        input: "http://http.example.com",
        expectedOutput: "hxxp[://]http[.]example[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP in path",
        input: "http://example.com/http",
        expectedOutput: "hxxp[://]example[.]com/http",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP in path segment",
        input: "http://example.com/path/http-resource",
        expectedOutput: "hxxp[://]example[.]com/path/http-resource",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP in query parameter",
        input: "http://example.com/?redirect=http://other.com",
        expectedOutput: "hxxp[://]example[.]com/?redirect=http[://]other[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP in fragment",
        input: "http://example.com/#http",
        expectedOutput: "hxxp[://]example[.]com/#http",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: Multiple URLs",
        input: "http://a.com/http https://b.com/https",
        expectedOutput: "hxxp[://]a[.]com/http hxxps[://]b[.]com/https",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: Domain-only input",
        input: "httpbin.example.com",
        expectedOutput: "httpbin[.]example[.]com",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: Uppercase and mixed-case schemes",
        input: "HTTP://HTTP.example.com HtTpS://hTtPbIn.example.com/HtTp",
        expectedOutput: "hxxp[://]HTTP[.]example[.]com hxxpS[://]hTtPbIn[.]example[.]com/HtTp",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Valid domains and full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: Only full URLs",
        input: "http://example.com/http",
        expectedOutput: "hxxp[://]example[.]com/http",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Only full URLs"],
            },
        ],
    },
    {
        name: "Defang URL: Everything preserves global HTTP escaping",
        input: "http://http.example.com/http",
        expectedOutput: "hxxp[://]hxxp[.]example[.]com/hxxp",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, true, true, "Everything"],
            },
        ],
    },
    {
        name: "Defang URL: HTTP escaping disabled",
        input: "http://http.example.com/http",
        expectedOutput: "http[://]http[.]example[.]com/http",
        recipeConfig: [
            {
                op: "Defang URL",
                args: [true, false, true, "Valid domains and full URLs"],
            },
        ],
    },
]);
