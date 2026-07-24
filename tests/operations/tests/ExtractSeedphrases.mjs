/**
 * Seedphrase Extract tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract Seedphrases - BIP39 - Basic With Extra Newlines",
        input: "Test BIP39 Seedphrase:\n\nfitness shed \ntape chef fiber behave dad again glass number please panic\n\nThis has been a test.",
        expectedOutput: "fitness shed tape chef fiber behave dad again glass number please panic\n",
        recipeConfig: [
            {
                "op": "Extract Seedphrases",
                "args": ["bip39"]
            },
        ],
    },
    {
        name: "Extract Seedphrases - BIP39 - Basic With Extra Newlines and Tabs",
        input: "Test BIP39 Seedphrase:\n\nfitness \tshed \ntape chef fiber behave dad again \t\nglass number \n\tplease panic\n\nThis has been a test.",
        expectedOutput: "fitness shed tape chef fiber behave dad again glass number please panic\n",
        recipeConfig: [
            {
                "op": "Extract Seedphrases",
                "args": ["bip39"]
            },
        ],
    },
    {
        name: "Extract Seedphrases - BIP39 - Basic With Extra Newlines and not actual words.",
        input: "Test BIP39 Seedphrase:\n\nfitness shed \ntape chef 1: fiber behave 2: dad again glass 4:number please panic\n\nThis has been a test.",
        expectedOutput: "fitness shed tape chef fiber behave dad again glass number please panic\n",
        recipeConfig: [
            {
                "op": "Extract Seedphrases",
                "args": ["bip39"]
            },
        ],
    },
    {
        name: "Extract Seedphrases - Electrum2 - Basic with Extra Newlines",
        input: "Test Electrum2 Seedphrase:\n\nventure enter \nribbon belt anger razor problem believe swap silk bike blur\n\nThis has been a test.",
        expectedOutput: "venture enter ribbon belt anger razor problem believe swap silk bike blur\n",
        recipeConfig: [
            {
                "op": "Extract Seedphrases",
                "args": ["electrum2"]
            },
        ],
    }

]);
