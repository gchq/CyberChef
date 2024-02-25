/**
 * Rotate tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Rotate left: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate left",
                args: [1, false],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Rotate left: normal",
        input: "61 62 63 31 32 33",
        expectedOutput: "c2 c4 c6 62 64 66",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate left",
                args: [1, false],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Rotate left: carry",
        input: "61 62 63 31 32 33",
        expectedOutput: "85 89 8c c4 c8 cd",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate left",
                args: [2, true],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Rotate right: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate right",
                args: [1, false],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Rotate right: normal",
        input: "61 62 63 31 32 33",
        expectedOutput: "b0 31 b1 98 19 99",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate right",
                args: [1, false],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Rotate right: carry",
        input: "61 62 63 31 32 33",
        expectedOutput: "d8 58 98 cc 4c 8c",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"],
            },
            {
                op: "Rotate right",
                args: [2, true],
            },
            {
                op: "To Hex",
                args: ["Space"],
            },
        ],
    },
    {
        name: "ROT13: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "ROT13",
                args: [true, true, true, 13],
            },
        ],
    },
    {
        name: "ROT13: normal",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: "Gur Dhvpx Oebja Sbk Whzcrq Bire Gur Ynml Qbt.",
        recipeConfig: [
            {
                op: "ROT13",
                args: [true, true, true, 13],
            },
        ],
    },
    {
        name: "ROT13: full loop",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        recipeConfig: [
            {
                op: "ROT13",
                args: [true, true, true, 26],
            },
        ],
    },
    {
        name: "ROT13: lowercase only",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: "Tur Qhvpx Bebja Fbk Jhzcrq Oire Tur Lnml Dbt.",
        recipeConfig: [
            {
                op: "ROT13",
                args: [true, false, false, 13],
            },
        ],
    },
    {
        name: "ROT13: uppercase only",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: "Ghe Duick Orown Sox Wumped Bver Ghe Yazy Qog.",
        recipeConfig: [
            {
                op: "ROT13",
                args: [false, true, false, 13],
            },
        ],
    },
    {
        name: "ROT47: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "ROT47",
                args: [47],
            },
        ],
    },
    {
        name: "ROT47: normal",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: '%96 "F:4< qC@H? u@I yF>A65 ~G6C %96 {2KJ s@8]',
        recipeConfig: [
            {
                op: "ROT47",
                args: [47],
            },
        ],
    },
    {
        name: "ROT47: full loop",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        recipeConfig: [
            {
                op: "ROT47",
                args: [94],
            },
        ],
    },
    {
        name: "ROT8000: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "ROT8000",
                args: [],
            },
        ],
    },
    {
        name: "ROT8000: normal",
        input: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        expectedOutput:
            "籝籱籮 籚籾籲籬籴 籋类籸粀籷 籏籸粁 籓籾籶籹籮籭 籘籿籮类 籝籱籮 籕籪粃粂 籍籸籰簷",
        recipeConfig: [
            {
                op: "ROT8000",
                args: [],
            },
        ],
    },
    {
        name: "ROT8000: backward",
        input: "籝籱籮 籚籾籲籬籴 籋类籸粀籷 籏籸粁 籓籾籶籹籮籭 籘籿籮类 籝籱籮 籕籪粃粂 籍籸籰簷",
        expectedOutput: "The Quick Brown Fox Jumped Over The Lazy Dog.",
        recipeConfig: [
            {
                op: "ROT8000",
                args: [],
            },
        ],
    },
]);
