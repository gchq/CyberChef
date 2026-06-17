import TestRegister from "../../lib/TestRegister.mjs";
import Dish from "../../../src/core/Dish.mjs";
import it from "../../node/assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Dish - presentAs: should exist", () => {
        const dish = new Dish();
        assert(dish.presentAs);
    }),
    it("Disk - valid: should not err on serialized big_number", () => {
        const dish = new Dish({ c: 0, e: 0, s: 0 }, Dish.BIG_NUMBER);
        assert(dish.valid());
    })
]);
