import TestRegister from "../../lib/TestRegister.mjs";
import Utils from "../../../src/core/Utils.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Utils: should parse six backslashes correctly", () => {
        assert.equal(Utils.parseEscapedChars("\\\\\\\\\\\\"), "\\\\\\");
    }),

    it("Utils: should parse escaped quotes correctly", () => {
        assert.equal(Utils.parseEscapedChars("\\'"), "'");
    }),

    it("Utils: should parse escaped quotes and backslashes correctly", () => {
        assert.equal(Utils.parseEscapedChars("\\\\'"), "\\'");
    }),

    it("Utils: should parse escaped quotes and escaped backslashes correctly", () => {
        assert.equal(Utils.parseEscapedChars("\\\\\\'"), "\\'");
    })
]);
