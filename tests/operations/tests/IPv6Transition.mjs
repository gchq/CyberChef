/**
 * IPv6Transition tests.
 *
 * @author jb30795
 *
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "IPv6 Transition: IPv4 to IPv6",
        input: "198.51.100.7",
        expectedOutput: "6to4: 2002:c633:6407::/48\nIPv4 Mapped: ::ffff:c633:6407\nIPv4 Translated: ::ffff:0:c633:6407\nNat 64: 64:ff9b::c633:6407",
        recipeConfig: [
            {
                op: "IPv6 Transition Addresses",
                args: [],
            },
        ],
    }, {
        name: "IPv6 Transition: IPv6 to IPv4",
        input: "64:ff9b::c633:6407",
        expectedOutput: "IPv4: 198.51.100.7",
        recipeConfig: [
            {
                op: "IPv6 Transition Addresses",
                args: [],
            },
        ],
    }, {
        name: "IPv6 Transition: MAC to EUI-64",
        input: "a1:b2:c3:d4:e5:f6",
        expectedOutput: "EUI-64 Interface ID: a3b2:c3ff:fed4:e5f6",
        recipeConfig: [
            {
                op: "IPv6 Transition Addresses",
                args: [],
            },
        ],
    },
]);
