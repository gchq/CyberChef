import TestRegister from "../../lib/TestRegister.mjs";
import ToHTMLEntity from "../../../src/core/operations/ToHTMLEntity.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";

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
]);
