import TestRegister from "../../lib/TestRegister.mjs";
import Operation from "../../../src/core/Operation.mjs";
import it from "../../node/assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Operation - NaN number ingredients should use their default value", () => {
        const operation = new Operation();
        operation.args = [{
            name: "Offset",
            type: "number",
            value: 0
        }];

        operation.ingValues = [NaN];

        assert.deepStrictEqual(operation.ingValues, [0]);
    }),

    it("Operation - invalid number strings should still throw", () => {
        const operation = new Operation();
        operation.args = [{
            name: "Offset",
            type: "number",
            value: 0
        }];

        assert.throws(() => {
            operation.ingValues = ["NaN"];
        }, /Invalid ingredient value\. Not a number: NaN/);
    }),
]);
