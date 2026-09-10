/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import MulticharacterSubstitution from "../../../src/core/operations/MulticharacterSubstitution.mjs";

TestRegister.addApiTests([
    it("Multi-character substitution: excessive mappings are rejected", () => {
        const dictionary = JSON.stringify(Object.fromEntries(Array.from({length: 4097}, (_, i) => [String(i), ""])));
        assert.throws(() => new MulticharacterSubstitution().run("x", ["Custom", dictionary]), /at most 4096 mappings/);
    }),
    it("Multi-character substitution: metacharacters remain literal", () => {
        const dictionary = {"a-b": "dash", "/": "$&", "\\": "backslash", ".*": "star"};
        assert.strictEqual(new MulticharacterSubstitution().run("a-b / \\ .*", ["Custom", JSON.stringify(dictionary)]),
            "dash $& backslash star");
    }),
    it("Multi-character substitution: unknown preset is rejected", () => {
        assert.throws(() => new MulticharacterSubstitution().run("x", ["unknown", "{}"]), {type: "OperationError"});
    })
]);
