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
        name: "ExtractIPAddress IPv6 full and compressed on same line",
        input: "2001:0db8:0001:0000:0000:0ab9:C0A8:0102 can be compressed as follows: 2001:db8:1::ab9:C0A8:102.",
        expectedOutput: "2001:0db8:0001:0000:0000:0ab9:C0A8:0102\n2001:db8:1::ab9:C0A8:102",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress multiple compressed IPv6 on same line",
        input: "2001:db8::1 and 2001:db8::2 and ::1",
        expectedOutput: "2001:db8::1\n2001:db8::2\n::1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress IPv6 valid forms and boundaries",
        input: ":: ::1 fe80:: ::1:2:3:4:5:6:7 1:2:3:4:5:6:7:: ::ffff:192.0.2.128 2001:db8::192.0.2.1 [2001:db8::1]:8080 2001:db8::1/64",
        expectedOutput: "::\n::1\nfe80::\n::1:2:3:4:5:6:7\n1:2:3:4:5:6:7::\n::ffff:192.0.2.128\n2001:db8::192.0.2.1\n2001:db8::1\n2001:db8::1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress mixed IPv4 and IPv6 on same line",
        input: "192.0.2.1 2001:db8::1 ::ffff:10.0.0.1 10.0.0.2",
        expectedOutput: "192.0.2.1\n2001:db8::1\n::ffff:10.0.0.1\n10.0.0.2",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress IPv6 invalid and non-IPv6 strings",
        input: "1:2:3:4:5:6:7:8:9 1:2:3:4:5:6:7::8 ::1:2:3:4:5:6:7:8 2001:db8::1::2 12345::1 ::12345 foo::1 std::vector ::: ::ffff:192.0.2.256 192.168.1.1 00:11:22:33:44:55",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false]
            },
        ],
    },
]);

