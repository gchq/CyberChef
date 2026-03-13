import assert from "assert";
import BigNumber from "bignumber.js";
import it from "../assertionHandler.mjs";
import TestRegister from "../../lib/TestRegister.mjs";
import { median } from "../../../src/core/lib/Arithmetic.mjs";

TestRegister.addApiTests([
    it("Arithmetic: median sorts odd-length input", () => {
        const result = median([new BigNumber(10), new BigNumber(1), new BigNumber(2)]);
        assert.strictEqual(result.toString(), "2");
    }),

    it("Arithmetic: median keeps even-length behavior", () => {
        const result = median([new BigNumber(10), new BigNumber(1), new BigNumber(2), new BigNumber(5)]);
        assert.strictEqual(result.toString(), "3.5");
    }),
]);
