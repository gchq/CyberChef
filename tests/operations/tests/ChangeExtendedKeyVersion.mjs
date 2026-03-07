/**
 * Extended Key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Change Extended Key Version (Test Idempotence XPRV)",
        input: "xprv9s21ZrQH143K3LSmZ6frRpWYucY5KoUzD4xSU6Dj64nXtcBoPUE5cq3oBNyQVwBKDCimMN3k4gUUZ6eRMRFmt7HrrLdi2eZXBpAFXy4gx2c",
        expectedOutput: "xprv9s21ZrQH143K3LSmZ6frRpWYucY5KoUzD4xSU6Dj64nXtcBoPUE5cq3oBNyQVwBKDCimMN3k4gUUZ6eRMRFmt7HrrLdi2eZXBpAFXy4gx2c",
        recipeConfig: [
            {
                "op": "Change Extended Key Version",
                "args": ["xprv"],
            },
        ],
    },
    {
        name: "Change Extended Key Version (xprv to yprv))",
        input: "xprv9s21ZrQH143K3eogwtKjKajiVmJdwhtiaiT3iyysdeReAtijXNTSuCmnBCtEZM8C5b364oGZEdkVQ3tDCBLAvbvx2HzVs1pDbJ6rkR9xJMb",
        expectedOutput: "yprvABrGsX5C9jantwzonF7MXfqDfjT5tKtDVpyGWNsm1eoXDzXxn2d1XGRvCQqpZFn7VE9tpGs7hJ73HLVmuskBiqcYtdgvSvdhs2AW8yT3J9a",
        recipeConfig: [
            {
                "op": "Change Extended Key Version",
                "args": ["yprv"],
            },
        ],
    },
    {
        name: "Change Extended Key Version (xprv to zprv))",
        input: "xprv9s21ZrQH143K3eogwtKjKajiVmJdwhtiaiT3iyysdeReAtijXNTSuCmnBCtEZM8C5b364oGZEdkVQ3tDCBLAvbvx2HzVs1pDbJ6rkR9xJMb",
        expectedOutput: "zprvAWgYBBk7JR8GkFBvcbtyjkviqhbXpwsiQwVVHmmePfBQH6MC2gna9L64DcoQZAS2tsGhZkTg9xTbAd7LdaACX5J9kyPM2qTC8kE9XXGNzuP",
        recipeConfig: [
            {
                "op": "Change Extended Key Version",
                "args": ["zprv"],
            },
        ],
    },
    {
        name: "Change Extended Key Version (zprv to xprv))",
        input: "zprvAWgYBBk7JR8GkFBvcbtyjkviqhbXpwsiQwVVHmmePfBQH6MC2gna9L64DcoQZAS2tsGhZkTg9xTbAd7LdaACX5J9kyPM2qTC8kE9XXGNzuP",
        expectedOutput: "xprv9s21ZrQH143K3eogwtKjKajiVmJdwhtiaiT3iyysdeReAtijXNTSuCmnBCtEZM8C5b364oGZEdkVQ3tDCBLAvbvx2HzVs1pDbJ6rkR9xJMb",
        recipeConfig: [
            {
                "op": "Change Extended Key Version",
                "args": ["xprv"],
            },
        ],
    },
    {
        name: "Change Extended Key Version (bad cheksums))",
        input: "zprvAWgYBBk7JR8GkFBvcbtyjkviqhbXpwsiQwVVHmmePfBQH6MC2gna9L64DcoQZAS2tsGhZkTg9xTbAd7LdaACX5J9kyPM2qTC8kE9XXGNzuz",
        expectedOutput: "Error in deserializing key. Error is: Invalid checksum.",
        recipeConfig: [
            {
                "op": "Change Extended Key Version",
                "args": ["xprv"],
            },
        ],
    }
]);
