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
        name: "ExtractIPAddress backwards-compat: defang off ignores [.] defanged input",
        input: "192[.]168[.]1[.]1 plain 10.0.0.1",
        expectedOutput: "10.0.0.1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, false]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: fully defanged IPv4",
        input: "192[.]168[.]1[.]1",
        expectedOutput: "192[.]168[.]1[.]1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: fully defanged IPv6 long form",
        input: "2001[:]0db8[:]85a3[:]0000[:]0000[:]8a2e[:]0370[:]7343",
        expectedOutput: "2001[:]0db8[:]85a3[:]0000[:]0000[:]8a2e[:]0370[:]7343",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: fully defanged IPv6 shorthand",
        input: "2001[:]db8[:][:]1",
        expectedOutput: "2001[:]db8[:][:]1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: partial defang IPv4",
        input: "192.168[.]1.1 and 1[.]2.3[.]4",
        expectedOutput: "192.168[.]1.1\n1[.]2.3[.]4",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: mixed plain and defanged in one input",
        input: "plain 10.0.0.1 defanged 8[.]8[.]8[.]8",
        expectedOutput: "10.0.0.1\n8[.]8[.]8[.]8",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: defanged octal IPv4",
        input: "0123[.]0177[.]0234[.]0377",
        expectedOutput: "0123[.]0177[.]0234[.]0377",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: partial-defang octal IPv4",
        input: "0123.0177[.]0234[.]0377",
        expectedOutput: "0123.0177[.]0234[.]0377",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + removeLocal: full-defang local 10/8 filtered",
        input: "10[.]0[.]0[.]1 public 8[.]8[.]8[.]8",
        expectedOutput: "8[.]8[.]8[.]8",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, true, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + removeLocal: partial-defang local 192.168 filtered",
        input: "192.168[.]1[.]100 keeps 1.1.1.1",
        expectedOutput: "1.1.1.1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, true, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + removeLocal: full-defang 172.16/12 filtered",
        input: "172[.]16[.]0[.]1 public 9[.]9[.]9[.]9",
        expectedOutput: "9[.]9[.]9[.]9",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, true, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + unique: plain and defanged kept distinct",
        input: "1.1.1.1 1[.]1[.]1[.]1 1.1.1.1",
        expectedOutput: "1.1.1.1\n1[.]1[.]1[.]1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, true, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + sort: plain group sorts numerically before defanged group sorts lexically",
        input: "200.1.1.1 5.5.5.5 100[.]100[.]100[.]100 10[.]0[.]0[.]1",
        expectedOutput: "5.5.5.5\n200.1.1.1\n10[.]0[.]0[.]1\n100[.]100[.]100[.]100",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, true, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: IPv6 URI literal brackets stripped, inner extracted",
        input: "Connect to [2001:db8::1]:8080 please",
        expectedOutput: "2001:db8::1",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: trailing-digit trap does not over-extend defanged IP",
        input: "abc 192[.]168[.]1[.]1234",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on + displayTotal: count line includes defanged matches",
        input: "1.1.1.1 2[.]2[.]2[.]2 3[.]3[.]3[.]3",
        expectedOutput: "Total found: 3\n\n1.1.1.1\n2[.]2[.]2[.]2\n3[.]3[.]3[.]3",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, true, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on, IPv4 toggle off: defanged IPv4 input matches nothing",
        input: "192[.]168[.]1[.]1",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [false, true, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on, IPv6 toggle off: defanged IPv6 input matches nothing",
        input: "2001[:]db8[:][:]1",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, false, false, false, false, false, true]
            },
        ],
    },
    {
        name: "ExtractIPAddress defang on: pure ASCII text with no IPs returns empty",
        input: "the quick brown fox jumps over the lazy dog (no addresses here)",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Extract IP addresses",
                "args": [true, true, false, false, false, false, true]
            },
        ],
    },
]);

