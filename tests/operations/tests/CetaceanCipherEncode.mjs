/**
 * CetaceanCipher Encode tests
 *
 * @author dolphinOnKeys
 * @copyright Crown Copyright 2022
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Cetacean Cipher Encode",
        input: "a b c で",
        expectedOutput: "EEEEEEEEEeeEEEEe EEEEEEEEEeeEEEeE EEEEEEEEEeeEEEee EEeeEEEEEeeEEeee",
        recipeConfig: [
            {
                op: "Cetacean Cipher Encode",
                args: []
            },
        ],
    }
]);
