/**
 * Fang IP Addresses tests
 *
 * @author HarelKatz [github.com/HarelKatz]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Fang IP: Valid IPV4",
        input: "192[.]168[.]1[.]1",
        expectedOutput: "192.168.1.1",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang IP: Valid IPV6",
        input: "2001[:]0db8[:]85a3[:]0000[:]0000[:]8a2e[:]0370[:]7343",
        expectedOutput: "2001:0db8:85a3:0000:0000:8a2e:0370:7343",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang IP: Valid IPV6 Shorthand",
        input: "2001[:]db8[:]3c4d[:]15[:][:]1a2f[:]1a2b",
        expectedOutput: "2001:db8:3c4d:15::1a2f:1a2b",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang IP: Multiple defanged IPs in surrounding text",
        input: "Connect to 10[.]0[.]0[.]1 or 192[.]168[.]1[.]254",
        expectedOutput: "Connect to 10.0.0.1 or 192.168.1.254",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang IP: Plain IP input is unchanged",
        input: "192.168.1.1",
        expectedOutput: "192.168.1.1",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang IP: Restore dots only",
        input: "192[.]168[.]1[.]1 ::[:]1",
        expectedOutput: "192.168.1.1 ::[:]1",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [true, false],
            },
        ],
    },
    {
        name: "Fang IP: Restore colons only",
        input: "192[.]168[.]1[.]1 2001[:]db8[:][:]1",
        expectedOutput: "192[.]168[.]1[.]1 2001:db8::1",
        recipeConfig: [
            {
                op: "Fang IP Addresses",
                args: [false, true],
            },
        ],
    },
]);
