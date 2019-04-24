import assert from "assert";
import it from "../assertionHandler";
import TestRegister from "../../lib/TestRegister";
import { Dish, toBase32, SHA3 } from "../../../src/node/index";
import fs from "fs";

TestRegister.addApiTests([
    it("Composable Dish: Should have top level Dish object", () => {
        assert.ok(Dish);
    }),

    it("Composable Dish: Should construct empty dish object", () => {
        const dish = new Dish();
        assert.strictEqual(dish.value.byteLength, new ArrayBuffer(0).byteLength);
        assert.strictEqual(dish.type, 4);
    }),

    it("Composable Dish: constructed dish should have apply prototype functions", () => {
        const dish = new Dish();
        assert.ok(dish.apply);
        assert.throws(() => dish.someInvalidFunction());
    }),

    it("Composable Dish: composed function returns another dish", () => {
        const result = new Dish("some input").apply(toBase32);
        assert.ok(result instanceof Dish);
    }),


    it("Composable dish: infers type from input if needed", () => {
        const dish = new Dish("string input");
        assert.strictEqual(dish.type, 1);

        const numberDish = new Dish(333);
        assert.strictEqual(numberDish.type, 2);

        const arrayBufferDish = new Dish(Buffer.from("some buffer input").buffer);
        assert.strictEqual(arrayBufferDish.type, 4);

        const byteArrayDish = new Dish(Buffer.from("some buffer input"));
        assert.strictEqual(byteArrayDish.type, 0);

        const JSONDish = new Dish({key: "value"});
        assert.strictEqual(JSONDish.type, 6);
    }),

    it("Composable dish: Buffer type dishes should be converted to strings", () => {
        fs.writeFileSync("test.txt", "abc");
        const dish = new Dish(fs.readFileSync("test.txt"));
        assert.strictEqual(dish.type, 0);
        fs.unlinkSync("test.txt");
    }),

    it("Composable Dish: apply should allow set of arguments for operation", () => {
        const result = new Dish("input").apply(SHA3, {size: "256"});
        assert.strictEqual(result.toString(), "7640cc9b7e3662b2250a43d1757e318bb29fb4860276ac4373b67b1650d6d3e3");
    }),

    it("Composable Dish: apply functions can be chained", () => {
        const result = new Dish("input").apply(toBase32).apply(SHA3, {size: "224"});
        assert.strictEqual(result.toString(), "493e8136b759370a415ef2cf2f7a69690441ff86592aba082bc2e2e0");
    }),

    // it("Dish translation: ArrayBuffer to ArrayBuffer", () => {
    //     const dish = new Dish();
        
    // }),
]);
