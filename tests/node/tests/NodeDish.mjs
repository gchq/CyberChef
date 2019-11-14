import assert from "assert";
import it from "../assertionHandler.mjs";
import fs from "fs";

import BigNumber from "bignumber.js";

import { Dish, toBase32, SHA3 } from "../../../src/node/index.mjs";
import File from "../../../src/node/File.mjs";
import TestRegister from "../../lib/TestRegister.mjs";

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

    it("Dish translation: ArrayBuffer to ArrayBuffer", () => {
        const dish = new Dish(new ArrayBuffer(10), 4);
        dish.get("array buffer");
        assert.strictEqual(dish.value.byteLength, 10);
        assert.strictEqual(dish.type, 4);
    }),

    it("Dish translation: ArrayBuffer and String", () => {
        const dish = new Dish("some string", 1);
        dish.get("array buffer");

        assert.strictEqual(dish.type, 4);
        assert.deepStrictEqual(dish.value, new Uint8Array([0x73, 0x6f, 0x6d, 0x65, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67]).buffer);
        assert.deepEqual(dish.value.byteLength, 11);

        dish.get("string");
        assert.strictEqual(dish.type, 1);
        assert.strictEqual(dish.value, "some string");
    }),

    it("Dish translation: ArrayBuffer and number", () => {
        const dish = new Dish(100, 2);
        dish.get(4);

        assert.strictEqual(dish.type, 4);
        assert.deepStrictEqual(dish.value, new Uint8Array([0x31, 0x30, 0x30]).buffer);
        assert.strictEqual(dish.value.byteLength, 3);

        // Check the data in ArrayBuffer represents 100 as a string.
        const view = new DataView(dish.value, 0);
        assert.strictEqual(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2)), "100");

        dish.get("number");
        assert.strictEqual(dish.type, 2);
        assert.strictEqual(dish.value, 100);
    }),

    it("Dish translation: ArrayBuffer and byte array", () => {
        const dish = new Dish(new Uint8Array([1, 2, 3]), 0);
        dish.get(4);

        // Check intermediate value
        const check = new Uint8Array(dish.value);
        assert.deepEqual(check, new Uint8Array([1, 2, 3]));

        // Check converts back OK
        dish.get(0);
        assert.deepEqual(dish.value, [1, 2, 3]);
    }),

    it("Dish translation: ArrayBuffer and HTML", () => {
        const html = `<!DOCTYPE html>
<html>
    <head>
    <meta charset="utf-8">
    </head>
    <body>
    <a href="https://github.com">Click here</a>
    <script src="script.js"></script>
    </body>
</html>`.replace(/\n|\s{4}/g, ""); // remove newlines, tabs

        const dish = new Dish(html, Dish.HTML);
        dish.get(4);

        dish.get(3);
        assert.strictEqual(dish.value, "Click here");
    }),

    it("Dish translation: ArrayBuffer and BigNumber", () => {
        const number = BigNumber(4001);
        const dish = new Dish(number, Dish.BIG_NUMBER);

        dish.get(Dish.ARRAY_BUFFER);
        assert.deepStrictEqual(dish.value, new Uint8Array([0x34, 0x30, 0x30, 0x31]).buffer);
        assert.strictEqual(dish.value.byteLength, 4);

        // Check the data in ArrayBuffer represents 4001 as a string.
        const view = new DataView(dish.value, 0);
        assert.strictEqual(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)), "4001");

        dish.get(5);
        assert.deepStrictEqual(dish.value, number);
    }),

    it("Dish translation: ArrayBuffer and JSON", () => {
        const jsonString = "{\"a\": 123455, \"b\": { \"aa\": [1,2,3]}}";
        const dish = new Dish(JSON.parse(jsonString), Dish.JSON);

        dish.get(Dish.ARRAY_BUFFER);
        dish.get(Dish.JSON);

        assert.deepStrictEqual(dish.value, JSON.parse(jsonString));
    }),

    it("Dish translation: ArrayBuffer and File", () => {
        const file = new File("abcd", "unknown");
        const dish = new Dish(file, Dish.FILE);

        dish.get(Dish.ARRAY_BUFFER);
        assert.deepStrictEqual(dish.value, new Uint8Array([0x61, 0x62, 0x63, 0x64]).buffer);
        assert.strictEqual(dish.value.byteLength, 4);

        // Check the data in ArrayBuffer represents "abcd"
        const view = new DataView(dish.value, 0);
        assert.strictEqual(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)), "abcd");

        dish.get(Dish.FILE);

        assert.deepStrictEqual(dish.value.data, file.data);
        assert.strictEqual(dish.value.name, file.name);
        assert.strictEqual(dish.value.type, file.type);
        // Do not test lastModified
    }),

    it("Dish translation: ArrayBuffer and ListFile", () => {
        const file1 = new File("abcde", "unknown");
        const file2 = new File("fghijk", "unknown");

        const dish = new Dish([file1, file2], Dish.LIST_FILE);

        dish.get(Dish.ARRAY_BUFFER);
        assert.deepStrictEqual(dish.value, new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b]).buffer);
        assert.strictEqual(dish.value.byteLength, 11);

        dish.get(Dish.LIST_FILE);
        const dataArray = new Uint8Array(dish.value[0].data);
        // cant store chars in a Uint8Array, so make it a normal one.
        const actual = Array.prototype.slice.call(dataArray).map(c => String.fromCharCode(c)).join("");
        assert.strictEqual(actual, "abcdefghijk");
    }),
]);
