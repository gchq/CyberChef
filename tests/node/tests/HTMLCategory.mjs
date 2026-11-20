/**
 * HTMLCategory tests.
 *
 * @author Ben Younes
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

/* eslint no-console: 0 */

import TestRegister from "../../lib/TestRegister.mjs";
import HTMLCategory from "../../../src/web/HTMLCategory.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("HTMLCategory: sortOperations orders operations alphabetically by name", () => {
        const cat = new HTMLCategory("Data format", true);
        ["To Hexdump", "From Hexdump", "To Base64", "From Base64"].forEach(name => cat.addOperation({name}));

        const before = cat.opList.map(op => op.name);
        cat.sortOperations();
        const after = cat.opList.map(op => op.name);

        console.log("Before sort:", before.join(", "));
        console.log("After sort: ", after.join(", "));

        assert.deepStrictEqual(after, ["From Base64", "From Hexdump", "To Base64", "To Hexdump"]);
    }),
]);
