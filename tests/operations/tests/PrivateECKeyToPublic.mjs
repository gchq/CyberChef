/**
 * Private key to secp256k1 public key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Private EC Key to Public (Compressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "036cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e40",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [true],
            },
        ],
    },
    {
        name: "Private EC Key to Public (Uncompressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "046cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e401f8a5888434ba6abc1967c036cc28903283d0f43b53fee63a3fb0b416019892b",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false],
            },
        ],
    },
    {
        name: "Private EC Key to Public (From Bytes Uncompressed)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E",
        expectedOutput: "036cf115be1fc5f54585965817c735d74bdae03d9665a43704a9bdbf8a1c6b1e40",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true],
            },
        ],
    },
    {
        name: "Private EC Key to Public (Wrong Length)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Must pass a hex string of length 64, or a byte string of length 32. Got length 66",
        recipeConfig: [
            {
                "op": "Private EC Key to Public Key",
                "args": [false],
            },
        ],
    },
    {
        name: "Private EC Key to Public (From Bytes Uncompressed Wrong Length)",
        input: "5E2A8FDE9F861056607208F512287CFBD634E124044EE23EBF7289E8E7B3822E08",
        expectedOutput: "Must pass a hex string of length 64, or a byte string of length 32. Got length 33",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Private EC Key to Public Key",
                "args": [true],
            },
        ],
    }
]);
