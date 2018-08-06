/**
 * Haversine distance tests.
 *
 * @author Dachande663 [dachande663@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Haversine distance",
        input: "51.487263,-0.124323, 38.9517,-77.1467",
        expectedOutput: "5619355.701829259",
        recipeConfig: [
            {
                "op": "Haversine distance",
                "args": []
            }
        ],
    }
]);
