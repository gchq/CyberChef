/**
 * XML to JSON tests.
 *
 * @author jpledref [jp.ledref@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXPECTED_JSON = { "root": {"shelf": ["over"], "wood": ["do"], "natural": ["sale"]}};

TestRegister.addTests([
    {
        name: "XML to JSON",
        input: "<root>\n<shelf>over</shelf>\n<wood>do</wood>\n<natural>sale</natural>\n</root>",
        expectedOutput: EXPECTED_JSON,
        recipeConfig: [
            {
                op: "XML to JSON",
                args: []
            },
        ],
    }
]);
