/**
 * Avro to JSON tests.
 *
 * @author jarrodconnolly [jarrod@nestedquotes.ca]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "Bytes to Long",
        input: "This is a testing string!",
        expectedOutput: "529836718428447222471796396193323181240742300695594145834785",
        recipeConfig: [
            {
                op: "Bytes to Long",
                args: []
            }
        ],
    },
    {
        name: "Long to Bytes",
        input: "529836718428447222471796396193323181240742300695594145834785",
        expectedOutput: "This is a testing string!",
        recipeConfig: [
            {
                op: "Long to Bytes",
                args: []
            }
        ],
    }
]);
