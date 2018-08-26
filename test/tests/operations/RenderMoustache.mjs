/**
 * Render Moustache tests.
 *
 * @author gchq77703 []
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";


TestRegister.addTests([
    {
        name: "Render Moustache",
        input: `{
    "name": "Dave",
    "value": "£50,000",
    "in_england": true,
    "taxed_value": "£40,000"
}`,
        expectedOutput: `Hello Dave
You have just won £50,000!
Well, £40,000 after taxes.
`,
        recipeConfig: [
            {
                op: "Render Moustache",
                args: [`Hello {{name}}
You have just won {{value}}!
{{#in_england}}
Well, {{taxed_value}} after taxes.
{{/in_england}}`]
            }
        ],
    },
    {
        name: "Render Moustache",
        input: "{}",
        expectedOutput: "Hello .",
        recipeConfig: [
            {
                op: "Render Moustache",
                args: ["Hello {{name}}."]
            }
        ],
    },
]);
