/**
 * ExtractIPAddresses tests.
 *
 * @author gchqdev365 [gchqdev365@outlook.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "ExtractIPAddress All Zeros",
        input: "0.0.0.0",
        expectedOutput: "0.0.0.0",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress 255s",
        input: "255.255.255.255",
        expectedOutput: "255.255.255.255",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress double digits",
        input: "10.10.10.10 25.25.25.25 99.99.99.99",
        expectedOutput: "10.10.10.10\n25.25.25.25\n99.99.99.99",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress 256 in middle",
        input: "255.256.255.255 255.255.256.255",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress octal valid",
        input: "01.01.01.01 0123.0123.0123.0123 0377.0377.0377.0377",
        expectedOutput: "01.01.01.01\n0123.0123.0123.0123\n0377.0377.0377.0377",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress octal invalid",
        input: "0378.01.01.01 03.0377.2.3",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
]);

