/**
 * YamlBeautifier tests.
 *
 * @author MrMadFox [c.saipraneeth888@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests(
    [{
        name: "YAML Beautify: basic YAML",
        input: "key1: value1\nkey2: value2",
        expectedOutput: "key1: value1\nkey2: value2\n",
        recipeConfig: [{
            "op": "YAML Beautify",
            "args": []
        }]
    }, {
        name: "YAML Beautify: nested YAML",
        input: "key1:\n  subkey1: value1\n  subkey2: value2\nkey2: value3",
        expectedOutput: "key1:\n  subkey1: value1\n  subkey2: value2\nkey2: value3\n",
        recipeConfig: [{
            "op": "YAML Beautify",
            "args": []
        }]
    }, {
        name: "YAML Beautify: empty YAML",
        input: "",
        expectedOutput: "",
        recipeConfig: [{
            "op": "YAML Beautify",
            "args": []
        }]
    }, {
        name: "YAML Beautify: malformed YAML",
        input: "key1: value1\nkey2: value2\nkey3",
        expectedOutput: "key1: value",
        recipeConfig: [{
            "op": "YAML Beautify",
            "args": []
        }]
    }
    ]);
