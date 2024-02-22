/**
 * Haversine distance tests.
 *
 * @author Dachande663 [dachande663@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Haversine distance",
        input: "51.487263,-0.124323, 38.9517,-77.1467",
        expectedOutput: "5902542.836307819",
        recipeConfig: [
            {
                "op": "Haversine distance",
                "args": []
            }
        ],
    },
    {
        name: "Haversine distance, zero distance",
        input: "51.487263,-0.124323, 51.487263,-0.124323",
        expectedOutput: "0",
        recipeConfig: [
            {
                "op": "Haversine distance",
                "args": []
            }
        ],
    }
]);
