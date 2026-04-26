/**
 * Float tests.
 *
 * @author tcode2k16 [tcode2k16@gmail.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "To Float: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"]
            },
            {
                op: "To Float",
                args: ["Big Endian", "Float (4 bytes)", "Space"]
            }
        ],
    },
    {
        name: "To Float (Big Endian, 4 bytes): 0.5",
        input: "3f0000003f000000",
        expectedOutput: "0.5 0.5",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"]
            },
            {
                op: "To Float",
                args: ["Big Endian", "Float (4 bytes)", "Space"]
            }
        ]
    },
    {
        name: "To Float (Little Endian, 4 bytes): 0.5",
        input: "0000003f0000003f",
        expectedOutput: "0.5 0.5",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"]
            },
            {
                op: "To Float",
                args: ["Little Endian", "Float (4 bytes)", "Space"]
            }
        ]
    },
    {
        name: "To Float (Big Endian, 8 bytes): 0.5",
        input: "3fe00000000000003fe0000000000000",
        expectedOutput: "0.5 0.5",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"]
            },
            {
                op: "To Float",
                args: ["Big Endian", "Double (8 bytes)", "Space"]
            }
        ]
    },
    {
        name: "To Float (Little Endian, 8 bytes): 0.5",
        input: "000000000000e03f000000000000e03f",
        expectedOutput: "0.5 0.5",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"]
            },
            {
                op: "To Float",
                args: ["Little Endian", "Double (8 bytes)", "Space"]
            }
        ]
    },
    {
        name: "From Float: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Float",
                args: ["Big Endian", "Float (4 bytes)", "Space"]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "From Float (Big Endian, 4 bytes): 0.5",
        input: "0.5 0.5",
        expectedOutput: "3f0000003f000000",
        recipeConfig: [
            {
                op: "From Float",
                args: ["Big Endian", "Float (4 bytes)", "Space"]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "From Float (Little Endian, 4 bytes): 0.5",
        input: "0.5 0.5",
        expectedOutput: "0000003f0000003f",
        recipeConfig: [
            {
                op: "From Float",
                args: ["Little Endian", "Float (4 bytes)", "Space"]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "From Float (Big Endian, 8 bytes): 0.5",
        input: "0.5 0.5",
        expectedOutput: "3fe00000000000003fe0000000000000",
        recipeConfig: [
            {
                op: "From Float",
                args: ["Big Endian", "Double (8 bytes)", "Space"]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "From Float (Little Endian, 8 bytes): 0.5",
        input: "0.5 0.5",
        expectedOutput: "000000000000e03f000000000000e03f",
        recipeConfig: [
            {
                op: "From Float",
                args: ["Little Endian", "Double (8 bytes)", "Space"]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    }
]);
