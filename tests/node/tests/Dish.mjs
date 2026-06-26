import TestRegister from "../../lib/TestRegister.mjs";
import Dish from "../../../src/core/Dish.mjs";
import it from "../../node/assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Dish - presentAs: should exist", () => {
        const dish = new Dish();
        assert(dish.presentAs);
    }),

    it("Dish - isValid: rehydrates serialized BigNumber values", () => {
        const dish = new Dish({ c: [1], e: 0, s: 1 }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "1");
    }),

    it("Dish - isValid: rehydrates serialized NaN BigNumber values", () => {
        const dish = new Dish({ c: null, e: null, s: null }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "NaN");
    }),

]);
