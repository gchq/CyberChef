/**
 * To Geohash tests
 *
 * @author gchq77703
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "From Geohash",
        input: "ww8p1r4t8",
        expectedOutput: "37.83238649368286,112.55838632583618",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
    {
        name: "From Geohash",
        input: "ww8p1r",
        expectedOutput: "37.83416748046875,112.5604248046875",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
    {
        name: "From Geohash",
        input: "ww8",
        expectedOutput: "37.265625,113.203125",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
    {
        name: "From Geohash",
        input: "w",
        expectedOutput: "22.5,112.5",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
]);
