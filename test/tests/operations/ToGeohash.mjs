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
        name: "To Geohash",
        input: "37.8324,112.5584\n37.9324,-112.2584",
        expectedOutput: "ww8p1r4t8\n9w8pv3ruj",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [9],
            },
        ],
    },
    {
        name: "To Geohash",
        input: "37.8324,112.5584\n\n\n",
        expectedOutput: "ww8p1r4t8\n\n\n",
        recipeConfig: [
            {
                op: "To Geohash",
                args: [9],
            },
        ],
    },
]);
