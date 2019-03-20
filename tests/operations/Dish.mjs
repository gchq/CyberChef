import TestRegister from "../../lib/TestRegister";
import Dish from "../../src/core/Dish";
import it from "../node/assertionHandler";
import assert from "assert";

TestRegister.addApiTests([
    it("Dish - presentAs: should exist", () => {
        const dish = new Dish();
        assert(dish.presentAs);
    }),

]);
