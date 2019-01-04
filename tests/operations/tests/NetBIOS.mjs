/**
 * NetBIOS tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "Encode NetBIOS name",
        input: "The NetBIOS name",
        expectedOutput: "FEGIGFCAEOGFHEECEJEPFDCAGOGBGNGF",
        recipeConfig: [
            {
                op: "Encode NetBIOS Name",
                args: [65],
            },
        ],
    },
    {
        name: "Decode NetBIOS Name",
        input: "FEGIGFCAEOGFHEECEJEPFDCAGOGBGNGF",
        expectedOutput: "The NetBIOS name",
        recipeConfig: [
            {
                op: "Decode NetBIOS Name",
                args: [65],
            },
        ],
    },
]);
