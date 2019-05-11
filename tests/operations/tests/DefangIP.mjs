/**
 * DefangIP tests.
 *
 * @author h345983745
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Defang IP: Valid IPV4",
        input: "192.168.1.1",
        expectedOutput: "192[.]168[.]1[.]1",
        recipeConfig: [
            {
                op: "Defang IP",
                args: [true, true],
            },
        ],
    }, {
        name: "Defang IP: Valid IPV6",
        input: "2001:0db8:85a3:0000:0000:8a2e:0370:7343",
        expectedOutput: "2001[:]0db8[:]85a3[:]0000[:]0000[:]8a2e[:]0370[:]7343",
        recipeConfig: [
            {
                op: "Defang IP",
                args: [true, true],
            },
        ],
    }, {
        name: "Defang IP: Valid IPV6 Shorthand",
        input: "2001:db8:3c4d:15::1a2f:1a2b",
        expectedOutput: "2001[:]db8[:]3c4d[:]15[:][:]1a2f[:]1a2b",
        recipeConfig: [
            {
                op: "Defang IP",
                args: [true, true],
            },
        ],
    },
    {
        name: "Defang IP: IPV4 Only",
        input: "192.168.1.1  2001:0db8:85a3:0000:0000:8a2e:0370:7343",
        expectedOutput: "192[.]168[.]1[.]1  2001:0db8:85a3:0000:0000:8a2e:0370:7343",
        recipeConfig: [
            {
                op: "Defang IP",
                args: [true, false],
            },
        ],
    }, {
        name: "Defang IP: IPV6 Only",
        input: "192.168.1.1  2001:0db8:85a3:0000:0000:8a2e:0370:7343",
        expectedOutput: "192.168.1.1  2001[:]0db8[:]85a3[:]0000[:]0000[:]8a2e[:]0370[:]7343",
        recipeConfig: [
            {
                op: "Defang IP",
                args: [false, true],
            },
        ],
    }
]);
