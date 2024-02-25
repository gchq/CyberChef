/**
 * LS47 tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 *
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "LS47 Encrypt",
        input: "thequickbrownfoxjumped",
        expectedOutput: "(,t74ci78cp/8trx*yesu:alp1wqy",
        recipeConfig: [
            {
                op: "LS47 Encrypt",
                args: ["helloworld", 0, "test"]
            }
        ]
    },
    {
        name: "LS47 Decrypt",
        input: "(,t74ci78cp/8trx*yesu:alp1wqy",
        expectedOutput: "thequickbrownfoxjumped---test",
        recipeConfig: [
            {
                op: "LS47 Decrypt",
                args: ["helloworld", 0]
            }
        ]
    },
    {
        name: "LS47 Encrypt",
        input: "thequickbrownfoxjumped",
        expectedOutput: "Letter H is not included in LS47",
        recipeConfig: [
            {
                op: "LS47 Encrypt",
                args: ["Helloworld", 0, "test"]
            }
        ]
    }
]);
