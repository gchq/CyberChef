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
        name: "To Geohash",
        input: "37.8324,112.5584",
        expectedOutput: "ww8p1r4t8",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [9],
            },
        ],
    },
    {
        name: "To Geohash",
        input: "37.9324,-112.2584",
        expectedOutput: "9w8pv3ruj",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [9],
            },
        ],
    },
    {
        name: "To Geohash",
        input: "37.8324,112.5584",
        expectedOutput: "ww8",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [3],
            },
        ],
    },
    {
        name: "To Geohash",
        input: "37.9324,-112.2584",
        expectedOutput: "9w8pv3rujxy5b99",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [15],
            },
        ],
    },
]);
