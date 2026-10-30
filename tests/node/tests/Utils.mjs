import TestRegister from "../../lib/TestRegister.mjs";
import Utils from "../../../src/core/Utils.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    ...[
        ["literal percent", "#recipe=To_Hex('%',0)", {recipe: "To_Hex('%',0)"}],
        ["short escape", "?value=%2", {value: "%2"}],
        ["non-hex escape", "value=%GG", {value: "%GG"}],
        ["mixed escapes", "value=50%25%20off%", {value: "50% off%"}],
        ["invalid UTF-8", "value=%FF", {value: "\uFFFD"}],
        ["truncated UTF-8", "value=%E0%A4", {value: "\uFFFD"}],
        ["encoded percent", "value=%2525", {value: "%25"}],
        ["Unicode", "value=%F0%9F%98%80", {value: "\u{1F600}"}],
        ["plus and separators", "value=a+b%2Bc%26d%3De", {value: "a b+c&d=e"}],
        ["flags and duplicates", "?flag&value=first&value=second&empty=", {flag: true, value: "second", empty: ""}],
        ["empty parameters", "", {}]
    ].map(([name, input, expected]) => it(`Utils: URI parameters handle ${name}`, () => {
        assert.deepStrictEqual(Utils.parseURIParams(input), expected);
    })),

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
    }),

    it("Utils: should replace delete character", () => {
        assert.equal(
            Utils.printable("\x7e\x7f\x80\xa7", false, true),
            "\x7e...",
        );
    }),

    it("Utils: should parse normal pretty recipes", () => {
        assert.deepStrictEqual(
            Utils.parseRecipeConfig("From_Base64('A-Za-z0-9+/=',true)To_Hex('Space')"),
            [
                {
                    op: "From Base64",
                    args: ["A-Za-z0-9+/=", true],
                },
                {
                    op: "To Hex",
                    args: ["Space"],
                },
            ],
        );
    }),

    it("Utils: should parse pretty recipe options", () => {
        assert.deepStrictEqual(
            Utils.parseRecipeConfig("A(/disabled/breakpoint)"),
            [
                {
                    op: "A",
                    args: [],
                    disabled: true,
                    breakpoint: true,
                },
            ],
        );
    }),

    it("Utils: should parse escaped quotes and backslashes in pretty recipes", () => {
        assert.deepStrictEqual(
            Utils.parseRecipeConfig("A('\\'\\\\')"),
            [
                {
                    op: "A",
                    args: ["'\\"],
                },
            ],
        );
    }),

    it("Utils: should parse large valid quoted pretty recipe arguments", () => {
        const value = "x".repeat(10000);

        assert.deepStrictEqual(
            Utils.parseRecipeConfig(`A('${value}')`),
            [
                {
                    op: "A",
                    args: [value],
                },
            ],
        );
    }),

    it("Utils: should reject malformed pretty recipes with unmatched quotes", () => {
        assert.throws(
            () => Utils.parseRecipeConfig("A(" + "'".repeat(10000)),
            /Invalid recipe/,
        );
    }),

    it("Utils: should reject malformed pretty recipes with malformed parentheses", () => {
        assert.throws(
            () => Utils.parseRecipeConfig("A("),
            /Invalid recipe/,
        );
    }),

    it("Utils: should reject malformed pretty recipes with malformed escapes", () => {
        assert.throws(
            () => Utils.parseRecipeConfig("A('" + "\\".repeat(10000)),
            /Invalid recipe/,
        );
    }),
]);
