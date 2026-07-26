/**
 * DechunkHTTPResponse operation tests.
 *
 * @author Willi Ballenthin
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Dechunk HTTP response: CRLF line endings",
        input: "7\r\nMozilla\r\n9\r\nDeveloper\r\n7\r\nNetwork\r\n0\r\n\r\n",
        expectedOutput: "MozillaDeveloperNetwork",
        recipeConfig: [
            {
                op: "Dechunk HTTP response",
                args: [],
            },
        ],
    },
    {
        name: "Dechunk HTTP response: LF line endings",
        input: "7\nMozilla\n9\nDeveloper\n7\nNetwork\n0\n\n",
        expectedOutput: "MozillaDeveloperNetwork",
        recipeConfig: [
            {
                op: "Dechunk HTTP response",
                args: [],
            },
        ],
    },
    {
        name: "Dechunk HTTP response: single chunk",
        input: "5\r\nHello\r\n0\r\n\r\n",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "Dechunk HTTP response",
                args: [],
            },
        ],
    },
    {
        name: "Dechunk HTTP response: trailing headers discarded",
        input: "7\nMozilla\n9\nDeveloper\n7\nNetwork\n0\nExpires: Wed, 21 Oct 2015 07:28:00 GMT\n",
        expectedOutput: "MozillaDeveloperNetwork",
        recipeConfig: [
            {
                op: "Dechunk HTTP response",
                args: [],
            },
        ],
    },
    {
        name: "Dechunk HTTP response: hex chunk sizes",
        input: "a\r\n0123456789\r\n0\r\n\r\n",
        expectedOutput: "0123456789",
        recipeConfig: [
            {
                op: "Dechunk HTTP response",
                args: [],
            },
        ],
    },
]);
