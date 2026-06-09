/**
 * ROR13 tests.
 *
 * @author fufu_btw [contact@fufu.red]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "ROR13: AddConsoleAliasW",
        input: "AddConsoleAliasW",
        expectedOutput: "0x9916128C",
        recipeConfig: [
            {
                op: "ROR13",
                args: [false]
            },
        ],
    },
    {
        name: "ROR13 Hash: LoadLibraryA",
        input: "LoadLibraryA",
        expectedOutput: "0xEC0E4E8E",
        recipeConfig: [
            {
                op: "ROR13",
                args: [false]
            },
        ],
    },
    {
        name: "ROR13 Hash: CloseHandle",
        input: "CloseHandle",
        expectedOutput: "0x0FFD97FB",
        recipeConfig: [
            {
                op: "ROR13",
                args: [false]
            },
        ],
    },
]);
