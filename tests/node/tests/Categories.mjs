import TestRegister from "../../lib/TestRegister.mjs";
import Categories from "../../../src/core/config/Categories.json";
import OperationConfig from "../../../src/core/config/OperationConfig.json";
import it from "../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("Categories: operations should be in a category", () => {
        const catOps = [];
        Categories.forEach(cat => {
            catOps.push(...cat.ops);
        });

        for (const op in OperationConfig) {
            assert(catOps.includes(op), `'${op}' operation is not present in any category`);
        }
    }),

]);
