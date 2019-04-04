import assert from "assert";
import it from "../assertionHandler";
import TestRegister from "../../lib/TestRegister";
import File from "../../../src/node/File";
import {zip, Dish} from "../../../src/node/index";
import { DishBigNumber } from "../../../src/core/dishTranslationTypes/index.mjs";

TestRegister.addApiTests([
    it("File: should exist", () => {
        assert(File);
    }),

    it("File: Should have same properties as DOM File object", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file = new File([uint8Array], "name.txt");
        assert.equal(file.name, "name.txt");
        assert(typeof file.lastModified, "number");
        assert(file.lastModifiedDate instanceof Date);
        assert.equal(file.size, uint8Array.length);
        assert.equal(file.type, "application/unknown");
    }),

    it("File: Should determine the type of a file", () => {
        const zipped = zip("hello");
        const file = new File([zipped.value]);
        assert(file);
        assert.strictEqual(file.type, "application/zip");
    }),

    it("File: unknown type should have a type of application/unknown", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file =  new File([uint8Array], "sample.txt");
        assert.strictEqual(file.type, "application/unknown");
    }),

    it("File: should be able to make a dish from it", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file =  new File([uint8Array], "sample.txt");
        try {
            const dish = new Dish(file, 7);
            assert.ok(dish.valid());
        } catch (e) {
            assert.fail(e.message);
        }
    }),

    it("File: should allow dish to translate to ArrayBuffer", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file =  new File([uint8Array], "sample.txt");
        try {
            const dish = new Dish(file, 7);
            assert.ok(dish.value);

            dish.get(4);
            assert.strictEqual(dish.type, 4);
            assert.ok(dish.valid());

        } catch (e) {
            assert.fail(e.message);
        }
    }),

    it("File: should allow dish to translate from ArrayBuffer to File", () => {
        const uint8Array = new Uint8Array(Buffer.from("hello"));
        const file =  new File([uint8Array], "sample.txt");
        try {
            const dish = new Dish(file, 7);
            assert.ok(dish.value);

            // translate to ArrayBuffer
            dish.get(4);
            assert.ok(dish.valid());

            // translate back to File
            dish.get(7);
            assert.ok(dish.valid());

        } catch (e) {
            assert.fail(e.message);
        }
    })

]);
