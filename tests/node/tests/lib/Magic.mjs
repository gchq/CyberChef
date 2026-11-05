import TestRegister from "../../../lib/TestRegister.mjs";
import Magic from "../../../../src/core/lib/Magic.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Magic: detector regex failures do not abort matching", () => {
        const input = new TextEncoder().encode("test").buffer;
        const criteria = [
            {
                op: "Failing detector",
                pattern: {
                    test: () => {
                        throw new RangeError("Maximum call stack size exceeded");
                    }
                }
            },
            {
                op: "Matching detector",
                pattern: /test/
            }
        ];

        const matches = new Magic(input, criteria).findMatchingInputOps();
        assert.deepStrictEqual(matches.map(match => match.op), ["Matching detector"]);
    })
]);
