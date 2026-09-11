import TestRegister from "../../lib/TestRegister.mjs";
import Magic from "../../../src/core/lib/Magic.mjs";
import Recipe from "../../../src/core/Recipe.mjs";
import Dish from "../../../src/core/Dish.mjs";
import it from "../../node/assertionHandler.mjs";
import assert from "assert";
import log from "loglevel";

TestRegister.addApiTests([
    it("Magic - speculative OperationErrors are silent", async () => {
        const input = new TextEncoder().encode("AAAAAAAAAAAAAAAAAAAAABrTYtyRTrTtYGc").buffer;
        const magic = new Magic(input);
        const originalError = log.error;
        const errors = [];
        log.error = (...args) => errors.push(args);

        try {
            const result = await magic._runRecipe([{
                op: "From Base85",
                args: ["A", false, ""]
            }]);
            assert.strictEqual(result.byteLength, 0);
            assert.strictEqual(errors.length, 0);
        } finally {
            log.error = originalError;
        }
    }),

    it("Recipe - normal OperationErrors are still logged", async () => {
        const dish = new Dish();
        dish.set("test", Dish.STRING);
        const recipe = new Recipe([{op: "From Base85", args: ["A", false, ""]}]);
        const originalError = log.error;
        const errors = [];
        log.error = (...args) => errors.push(args);

        try {
            await recipe.execute(dish);
            assert.strictEqual(errors.length, 1);
        } finally {
            log.error = originalError;
        }
    }),
]);
