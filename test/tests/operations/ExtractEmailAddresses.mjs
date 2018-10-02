/**
 * Parse IP Range tests.
 *
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Extract email address",
        input: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com email@example.name\nemail@example.museum email@example.co.jp firstname-lastname@example.com",
        expectedOutput: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com\nemail@example.name\nemail@example.museum\nemail@example.co.jp\nfirstname-lastname@example.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [false]
            },
        ],
    },
    {
        name: "Extract email address - Display total",
        input: "email@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com email@example.name\nemail@example.museum email@example.co.jp firstname-lastname@example.com",
        expectedOutput: "Total found: 11\n\nemail@example.com\nfirstname.lastname@example.com\nemail@subdomain.example.com\nfirstname+lastname@example.com\n1234567890@example.com\nemail@example-one.com\n_______@example.com\nemail@example.name\nemail@example.museum\nemail@example.co.jp\nfirstname-lastname@example.com\n",
        recipeConfig: [
            {
                "op": "Extract email addresses",
                "args": [true]
            },
        ],
    },
]);
