import TestRegister from "../../lib/TestRegister.mjs";
import ToHTMLEntity from "../../../src/core/operations/ToHTMLEntity.mjs";
import FromHTMLEntity from "../../../src/core/operations/FromHTMLEntity.mjs";
import { HTML_ENTITY_LOOKUP, HTML_ENTITY_REVERSE_LOOKUP } from "../../../src/core/lib/HTMLEntities.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Vendored WHATWG named character reference set (https://html.spec.whatwg.org/entities.json).
const SPEC = JSON.parse(readFileSync(path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../src/core/vendor/htmlEntities/entity.json"), "utf8"));
const specByName = {};
for (const [key, val] of Object.entries(SPEC))
    if (key.endsWith(";")) specByName[key.slice(1, -1)] = val.codepoints;

TestRegister.addApiTests([
    it("To HTML Entity: every named entity in the table is well-formed", () => {
        // "Convert all characters" emits an entity for every code point, so a
        // correct table yields an unbroken stream of entity tokens. A malformed
        // value such as "&nge;;" or "&epsi;," leaves stray characters between
        // tokens, which the walk below flags and reports with surrounding context.
        let input = "";
        for (let cp = 0; cp <= 0xFFFF; cp++) {
            if (cp >= 0xD800 && cp <= 0xDFFF) continue; // skip surrogate range
            input += String.fromCodePoint(cp);
        }
        const output = new ToHTMLEntity().run(input, [true, "Named entities"]);

        const tokenRe = /&#[0-9]+;|&#x[0-9a-fA-F]+;|&[A-Za-z][A-Za-z0-9]*;/y;
        const malformed = [];
        let pos = 0;
        while (pos < output.length) {
            tokenRe.lastIndex = pos;
            if (tokenRe.exec(output)) {
                pos = tokenRe.lastIndex;
            } else {
                malformed.push(output.slice(Math.max(0, pos - 12), pos + 12));
                pos++;
            }
        }
        assert.deepStrictEqual(malformed, [], `Malformed entity value(s) near: ${JSON.stringify(malformed)}`);
    }),

    it("HTML Entity: named encoding round-trips through From HTML Entity", () => {
        // Because both operations share one lookup table, encoding a character to
        // a named entity and decoding it must return the original character for
        // every BMP code point: FromHTMLEntity(ToHTMLEntity(x)) === x.
        const toOp = new ToHTMLEntity(),
            fromOp = new FromHTMLEntity();
        const mismatches = [];
        for (let cp = 0; cp <= 0xFFFF; cp++) {
            if (cp >= 0xD800 && cp <= 0xDFFF) continue; // skip surrogate range
            const char = String.fromCodePoint(cp);
            const encoded = toOp.run(char, [true, "Named entities"]);
            const decoded = fromOp.run(encoded, []);
            if (decoded !== char)
                mismatches.push(`U+${cp.toString(16).toUpperCase().padStart(4, "0")} -> ${encoded} -> U+${decoded.codePointAt(0).toString(16).toUpperCase()}`);
        }
        assert.deepStrictEqual(mismatches, [], `Round-trip failed for: ${JSON.stringify(mismatches.slice(0, 20))}`);
    }),

    it("HTML Entity: every table entry is conformant with the WHATWG spec", () => {
        // Both lookup tables must agree with entities.json: every encode name is a
        // real spec name mapping to exactly that code point, and every decode name
        // maps to the spec code point.
        const violations = [];
        for (const [cp, name] of Object.entries(HTML_ENTITY_LOOKUP)) {
            const spec = specByName[name];
            if (!spec || spec.length !== 1 || spec[0] !== Number(cp))
                violations.push(`encode ${cp} -> &${name}; (spec: ${spec ? JSON.stringify(spec) : "none"})`);
        }
        for (const [name, cp] of Object.entries(HTML_ENTITY_REVERSE_LOOKUP)) {
            const spec = specByName[name];
            if (!spec || spec.length !== 1 || spec[0] !== cp)
                violations.push(`decode &${name}; -> ${cp} (spec: ${spec ? JSON.stringify(spec) : "none"})`);
        }
        assert.deepStrictEqual(violations, [], `Spec violations: ${JSON.stringify(violations.slice(0, 20))}`);
    }),
]);
