/**
 * To Geohash tests
 *
 * @author gchq77703
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "From Geohash",
        input: "ww8p1r4t8\nww8p1r\nww8\nw",
        expectedOutput: "37.83238649368286,112.55838632583618\n37.83416748046875,112.5604248046875\n37.265625,113.203125\n22.5,112.5",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
    {
        name: "From Geohash",
        input: "w\n\nw\n\n\nw",
        expectedOutput: "22.5,112.5\n0,0\n22.5,112.5\n0,0\n0,0\n22.5,112.5",
        recipeConfig: [
            {
                op: "From Geohash",
                args: [],
            },
        ],
    },
]);
