/**
 * Parse IP Range tests.
 *
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Parse IPv4 CIDR",
        input: "10.0.0.0/30",
        expectedOutput: "Network: 10.0.0.0\nCIDR: 30\nMask: 255.255.255.252\nRange: 10.0.0.0 - 10.0.0.3\nTotal addresses in range: 4\n\n10.0.0.0\n10.0.0.1\n10.0.0.2\n10.0.0.3",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv4 hyphenated",
        input: "10.0.0.0 - 10.0.0.3",
        expectedOutput: "Minimum subnet required to hold this range:\n\tNetwork: 10.0.0.0\n\tCIDR: 30\n\tMask: 255.255.255.252\n\tSubnet range: 10.0.0.0 - 10.0.0.3\n\tTotal addresses in subnet: 4\n\nRange: 10.0.0.0 - 10.0.0.3\nTotal addresses in range: 4\n\n10.0.0.0\n10.0.0.1\n10.0.0.2\n10.0.0.3",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv4 list",
        input: "10.0.0.8\n10.0.0.5/30\n10.0.0.1\n10.0.0.3",
        expectedOutput: "Minimum subnet required to hold this range:\n\tNetwork: 10.0.0.0\n\tCIDR: 28\n\tMask: 255.255.255.240\n\tSubnet range: 10.0.0.0 - 10.0.0.15\n\tTotal addresses in subnet: 16\n\nRange: 10.0.0.1 - 10.0.0.8\nTotal addresses in range: 8\n\n10.0.0.1\n10.0.0.2\n10.0.0.3\n10.0.0.4\n10.0.0.5\n10.0.0.6\n10.0.0.7\n10.0.0.8",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv6 CIDR - full",
        input: "2404:6800:4001:0000:0000:0000:0000:0000/48",
        expectedOutput: "Network: 2404:6800:4001:0000:0000:0000:0000:0000\nShorthand: 2404:6800:4001::\nCIDR: 48\nMask: ffff:ffff:ffff:0000:0000:0000:0000:0000\nRange: 2404:6800:4001:0000:0000:0000:0000:0000 - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nTotal addresses in range: 1.2089258196146292e+24\n\n",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv6 CIDR - collapsed",
        input: "2404:6800:4001::/48",
        expectedOutput: "Network: 2404:6800:4001:0000:0000:0000:0000:0000\nShorthand: 2404:6800:4001::\nCIDR: 48\nMask: ffff:ffff:ffff:0000:0000:0000:0000:0000\nRange: 2404:6800:4001:0000:0000:0000:0000:0000 - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nTotal addresses in range: 1.2089258196146292e+24\n\n",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv6 hyphenated",
        input: "2404:6800:4001:: - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff",
        expectedOutput: "Range: 2404:6800:4001:0000:0000:0000:0000:0000 - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nShorthand range: 2404:6800:4001:: - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nTotal addresses in range: 1.2089258196146292e+24\n\n",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "Parse IPv6 list",
        input: "2404:6800:4001:ffff:ffff:ffff:ffff:ffff\n2404:6800:4001::ffff\n2404:6800:4001:ffff:ffff::1111\n2404:6800:4001::/64",
        expectedOutput: "Range: 2404:6800:4001:0000:0000:0000:0000:0000 - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nShorthand range: 2404:6800:4001:: - 2404:6800:4001:ffff:ffff:ffff:ffff:ffff\nTotal addresses in range: 1.2089258196146292e+24\n\n",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "IPv4 subnet out of range error",
        input: "10.1.1.1/34",
        expectedOutput: "IPv4 CIDR must be less than 32",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "invalid IPv4 address error",
        input: "444.1.1.1/30",
        expectedOutput: "Block out of range.",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "IPv6 subnet out of range error",
        input: "2404:6800:4001::/129",
        expectedOutput: "IPv6 CIDR must be less than 128",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
    {
        name: "invalid IPv6 address error",
        input: "2404:6800:4001:/12",
        expectedOutput: "Invalid input.\n\nEnter either a CIDR range (e.g. 10.0.0.0/24) or a hyphenated range (e.g. 10.0.0.0 - 10.0.1.0). IPv6 also supported.",
        recipeConfig: [
            {
                "op": "Parse IP range",
                "args": [true, true, false]
            },
        ],
    },
]);
