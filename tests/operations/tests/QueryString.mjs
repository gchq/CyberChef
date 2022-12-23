/**
 * Query String tests.
 *
 * @author Benjamin Altpeter [hi@bn.al]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

/**
 * Small helper for JSON.stringify() with the correct settings.
 * @param {any} obj An object to stringify
 * @returns A stringified version of the object, indented by four spaces.
 */
const json = (obj) => JSON.stringify(obj, null, 4);

TestRegister.addTests([
    {
        name: "Query String Decode simple example (defaults)",
        input: "?a=b&c=1&d=e;f=g",
        expectedOutput: json({
            a: "b",
            c: "1",
            d: "e;f=g",
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [5, 1000, "&", false, false] },
        ],
    },
    {
        name: "Query String Decode arrays and objects (defaults)",
        input: "a[]=b&a[2]=b&c[d]=e&f=g,h&i.j=k",
        expectedOutput: json({
            a: ["b", "b"],
            c: {
                d: "e",
            },
            f: "g,h",
            "i.j": "k",
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [5, 1000, "&", false, false] },
        ],
    },
    {
        name: "Query String Decode arrays and objects (extended)",
        input: "a[]=b&a[2]=b&c[d]=e&f=g,h&i.j=k",
        expectedOutput: json({
            a: ["b", "b"],
            c: {
                d: "e",
            },
            f: ["g", "h"],
            i: {
                j: "k",
            },
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [5, 1000, "&", true, true] },
        ],
    },
    {
        name: "Query String Decode delimiter",
        input: "a=b;c=d",
        expectedOutput: json({
            a: "b",
            c: "d",
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [5, 1000, ";", false, false] },
        ],
    },
    {
        name: "Query String Decode depth (default)",
        input: "a[b][c][d][e][f][g][h]=5",
        expectedOutput: json({
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: {
                                    "[g][h]": "5",
                                },
                            },
                        },
                    },
                },
            },
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [5, 1000, "&", false, false] },
        ],
    },
    {
        name: "Query String Decode depth (higher)",
        input: "a[b][c][d][e][f][g][h]=5",
        expectedOutput: json({
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: {
                                    g: {
                                        h: "5",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        recipeConfig: [
            { op: "Query String Decode", args: [7, 1000, "&", false, false] },
        ],
    },
]);
