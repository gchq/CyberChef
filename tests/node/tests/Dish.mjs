import TestRegister from "../../lib/TestRegister.mjs";
import Dish from "../../../src/core/Dish.mjs";
import it from "../../node/assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Dish - presentAs: should exist", () => {
        const dish = new Dish();
        assert(dish.presentAs);
    }),

    it("Disk - should not error on serialized BigNumber (0)", () => {
        const dish = new Dish({ s: 1, e: 0, c: [0] }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "0");
    }),

    it("Dish - should not error on serialized BigNumber (1)", () => {
        const dish = new Dish({ c: [1], e: 0, s: 1 }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "1");
    }),

    it("Dish - should not error on serialized BigNumber (-100)", () => {
        const dish = new Dish({ s: -1, e: 2, c: [100] }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "-100");
    }),

    it("Dish - should not error on serialized BigNumber (NaN)", () => {
        const dish = new Dish({ s: null, e: null, c: null }, Dish.BIG_NUMBER);
        assert.strictEqual(dish.value.toString(), "NaN");
    }),
]);
