/**
 * Generate TOTP Code tests.
 *
 * @author hellodword
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate TOTP Code",
        input: "",
        expectedOutput: "871328",
        recipeConfig: [
            {
                op: "Generate TOTP Code",
                args: ["KJLTAORSKZGV4RBMHNFDETRVKQUFMLZTHZYFOW2UFAYXIP23JVNQ", "SHA-1", 30, 6, 1465324707000],
            },
        ],
    },
]);
