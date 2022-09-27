/**
 * NTLM test.
 *
 * @author brun0ne [brunonblok@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "NTLM Hashing",
        input: "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()_+.,?/",
        expectedOutput: "C5FA1C40E55734A8E528DBFE21766D23",
        recipeConfig: [
            {
                op: "NTLM",
                args: [],
            },
        ],
    }
]);
