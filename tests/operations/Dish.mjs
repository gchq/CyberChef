import TestRegister from "../../lib/TestRegister.mjs";
import Dish from "../../src/core/Dish.mjs";
import it from "../node/assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Dish - presentAs: should exist", () => {
        const dish = new Dish();
        assert(dish.presentAs);
    }),

]);
