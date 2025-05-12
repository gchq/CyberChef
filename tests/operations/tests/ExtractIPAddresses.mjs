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
        name: "ExtractIPAddress All 10s",
        input: "10.10.10.10",
        expectedOutput: "10.10.10.10",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress All 10s",
        input: "100.100.100.100",
        expectedOutput: "100.100.100.100",
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
        name: "ExtractIPAddress 256 at each end",
        input: "256.255.255.255 255.255.255.256",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress silly example",
        input: "710.65.0.456",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress longer dotted decimal",
        input: "1.2.3.4.5.6.7.8",
        expectedOutput: "1.2.3.4\n5.6.7.8",
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
    {
        name: "ExtractIPAddress IPv6 full form",
        input: "This 2001:0db8:0001:0000:0000:0ab9:C0A8:0102 is a valid address.",
        expectedOutput: "2001:0db8:0001:0000:0000:0ab9:C0A8:0102",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress IPv6 short form",
        input: "Another valid style is the short form 2001:db8:1::ab9:C0A8:102 is a valid address.",
        expectedOutput: "2001:db8:1::ab9:C0A8:102",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress IPv6 both forms",
        input: "2001:0db8:0001:0000:0000:0ab9:C0A8:0102 can be compressed as follows: 2001:db8:1::ab9:C0A8:102.",
        expectedOutput: "2001:0db8:0001:0000:0000:0ab9:C0A8:0102\n2001:db8:1::ab9:C0A8:102",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
]);

