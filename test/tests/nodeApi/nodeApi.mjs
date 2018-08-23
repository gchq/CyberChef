/* eslint no-console: 0 */

/**
 * nodeApi.js
 *
 * Test node api utilities
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import assert from "assert";
import it from "../assertionHandler";
import chef from "../../../src/node/index";
import OperationError from "../../../src/core/errors/OperationError";
import SyncDish from "../../../src/node/SyncDish";

import { toBase32, Dish } from "../../../src/node/index";
import TestRegister from "../../TestRegister";

TestRegister.addApiTests([
    it("should have some operations", () => {
        assert(chef);
        assert(chef.toBase32);
        assert(chef.setUnion);
        assert(!chef.randomFunction);
    }),

    it("should export other functions at top level", () => {
        assert(toBase32);
    }),

    it("should be synchronous", () => {
        try {
            const result = chef.toBase32("input");
            assert.notEqual("something", result);
        } catch (e) {
            // shouldnt reach here
            assert(false);
        }

        try {
            const fail = chef.setUnion("1");
            // shouldnt get here
            assert(!fail || false);
        } catch (e) {
            assert(true);
        }
    }),

    it("should not catch Errors", () => {
        try {
            chef.setUnion("1");
            assert(false);
        } catch (e) {
            assert(e instanceof OperationError);
        }
    }),

    it("should accept arguments in object format for operations", () => {
        const result = chef.setUnion("1 2 3 4:3 4 5 6", {
            itemDelimiter: " ",
            sampleDelimiter: ":"
        });

        assert.equal(result.value, "1 2 3 4 5 6");
    }),

    it("should accept just some of the optional arguments being overriden", () => {
        const result = chef.setIntersection("1 2 3 4 5\\n\\n3 4 5", {
            itemDelimiter: " ",
        });

        assert.equal(result.value, "3 4 5");
    }),

    it("should accept no override arguments and just use the default values", () => {
        const result = chef.powerSet("1,2,3");
        assert.equal(result.value, "\n3\n2\n1\n2,3\n1,3\n1,2\n1,2,3\n");
    }),

    it("should return an object with a .to method", () => {
        const result = chef.toBase32("input");
        assert(result.to);
        assert.equal(result.to("string"), "NFXHA5LU");
    }),

    it("should return an object with a .get method", () => {
        const result = chef.toBase32("input");
        assert(result.get);
        assert.equal(result.get("string"), "NFXHA5LU");
    }),

    it("should return a SyncDish", () => {
        const result = chef.toBase32("input");
        assert(result instanceof SyncDish);
    }),

    it("should coerce to a string as you expect", () => {
        const result = chef.fromBase32(chef.toBase32("something"));
        assert.equal(String(result), "something");
        // This kind of coercion uses toValue
        assert.equal(""+result, "NaN");
    }),

    it("should coerce to a number as you expect", () => {
        const result = chef.fromBase32(chef.toBase32("32"));
        assert.equal(3 + result, 35);
    }),

    it("chef.help: should exist", () => {
        assert(chef.help);
    }),

    it("chef.help: should describe a operation", () => {
        const result = chef.help("tripleDESDecrypt");
        assert.strictEqual(result.name, "Triple DES Decrypt");
        assert.strictEqual(result.module, "Ciphers");
        assert.strictEqual(result.inputType, "string");
        assert.strictEqual(result.outputType, "string");
        assert.strictEqual(result.description, "Triple DES applies DES three times to each block to increase key size.<br><br><b>Key:</b> Triple DES uses a key length of 24 bytes (192 bits).<br>DES uses a key length of 8 bytes (64 bits).<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.");
        assert.strictEqual(result.args.length, 5);
    }),

    it("chef.help: null for invalid operation", () => {
        const result = chef.help("some invalid function name");
        assert.strictEqual(result, null);
    }),

    it("chef.help: takes a wrapped operation as input", () => {
        const result = chef.help(chef.toBase32);
        assert.strictEqual(result.name, "To Base32");
        assert.strictEqual(result.module, "Default");
    }),

    it("chef.bake: should exist", () => {
        assert(chef.bake);
    }),

    it("chef.bake: should return SyncDish", () => {
        const result = chef.bake("input", "to base 64");
        assert(result instanceof SyncDish);
    }),

    it("chef.bake: should take an input and an op name and perform it", () => {
        const result = chef.bake("some input", "to base 32");
        assert.strictEqual(result.toString(), "ONXW2ZJANFXHA5LU");
    }),

    it("chef.bake: should complain if recipe isnt a valid object", () => {
        try {
            chef.bake("some input", 3264);
        } catch (e) {
            assert.strictEqual(e.name, "TypeError");
            assert.strictEqual(e.message, "Recipe can only contain function names or functions");
        }
    }),

    it("chef.bake: Should complain if string op is invalid", () => {
        try {
            chef.bake("some input", "not a valid operation");
            assert.fail("Shouldn't be hit");
        } catch (e) {
            assert.strictEqual(e.name, "TypeError");
            assert.strictEqual(e.message, "Couldn't find an operation with name 'not a valid operation'.");
        }
    }),

    it("chef.bake: Should take an input and an operation and perform it", () => {
        const result = chef.bake("https://google.com/search?q=help", chef.parseURI);
        assert.strictEqual(result.toString(), "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = help\n");
    }),

    it("chef.bake: Should complain if an invalid operation is inputted", () => {
        try {
            chef.bake("https://google.com/search?q=help", () => {});
            assert.fail("Shouldn't be hit");
        } catch (e) {
            assert.strictEqual(e.name, "TypeError");
            assert.strictEqual(e.message, "Inputted function not a Chef operation.");
        }
    }),

    it("chef.bake: accepts an array of operation names and performs them all in order", () => {
        const result = chef.bake("https://google.com/search?q=that's a complicated question", ["URL encode", "URL decode", "Parse URI"]);
        assert.strictEqual(result.toString(), "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = that's a complicated question\n");
    }),

    it("chef.bake: if recipe is empty array, return input as dish", () => {
        const result = chef.bake("some input", []);
        assert.strictEqual(result.toString(), "some input");
        assert(result instanceof SyncDish, "Result is not instance of SyncDish");
    }),

    it("chef.bake: accepts an array of operations as recipe", () => {
        const result = chef.bake("https://google.com/search?q=that's a complicated question", [chef.URLEncode, chef.URLDecode, chef.parseURI]);
        assert.strictEqual(result.toString(), "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = that's a complicated question\n");
    }),

    it("should complain if an invalid operation is inputted as part of array", () => {
        try {
            chef.bake("something", [() => {}]);
        } catch (e) {
            assert.strictEqual(e.name, "TypeError");
            assert.strictEqual(e.message, "Inputted function not a Chef operation.");
        }
    }),

    it("chef.bake: should take single JSON object describing op and args OBJ", () => {
        const result = chef.bake("some input", {
            op: chef.toHex,
            args: {
                Delimiter: "Colon"
            }
        });
        assert.strictEqual(result.toString(), "73:6f:6d:65:20:69:6e:70:75:74");
    }),

    it("chef.bake: should take single JSON object describing op and args ARRAY", () => {
        const result = chef.bake("some input", {
            op: chef.toHex,
            args: ["Colon"]
        });
        assert.strictEqual(result.toString(), "73:6f:6d:65:20:69:6e:70:75:74");
    }),

    it("chef.bake: should error if op in JSON is not chef op", () => {
        try {
            chef.bake("some input", {
                op: () => {},
                args: ["Colon"],
            });
        } catch (e) {
            assert.strictEqual(e.name, "TypeError");
            assert.strictEqual(e.message, "Inputted function not a Chef operation.");
        }
    }),

    it("chef.bake: should take multiple ops in JSON object form, some ops by string", () => {
        const result = chef.bake("some input", [
            {
                op: chef.toHex,
                args: ["Colon"]
            },
            {
                op: "to octal",
                args: {
                    delimiter: "Semi-colon",
                }
            }
        ]);
        assert.strictEqual(result.toString(), "67;63;72;66;146;72;66;144;72;66;65;72;62;60;72;66;71;72;66;145;72;67;60;72;67;65;72;67;64");
    }),

    it("chef.bake: should handle op with multiple args", () => {
        const result = chef.bake("some input", {
            op: "to morse code",
            args: {
                formatOptions: "Dash/Dot",
                wordDelimiter: "Comma",
                letterDelimiter: "Backslash",
            }
        });
        assert.strictEqual(result.toString(), "DotDotDot\\DashDashDash\\DashDash\\Dot,DotDot\\DashDot\\DotDashDashDot\\DotDotDash\\Dash");
    }),

    it("chef.bake: should take compact JSON format from Chef Website as recipe", () => {
        const result = chef.bake("some input", [{"op": "To Morse Code", "args": ["Dash/Dot", "Backslash", "Comma"]}, {"op": "Hex to PEM", "args": ["SOMETHING"]}, {"op": "To Snake case", "args": [false]}]);
        assert.strictEqual(result.toString(), "begin_something_anananaaaaak_da_aaak_da_aaaaananaaaaaaan_da_aaaaaaanan_da_aaak_end_something");
    }),

    it("chef.bake: should accept Clean JSON format from Chef website as recipe", () => {
        const result = chef.bake("some input", [
            { "op": "To Morse Code",
                "args": ["Dash/Dot", "Backslash", "Comma"] },
            { "op": "Hex to PEM",
                "args": ["SOMETHING"] },
            { "op": "To Snake case",
                "args": [false] }
        ]);
        assert.strictEqual(result.toString(), "begin_something_anananaaaaak_da_aaak_da_aaaaananaaaaaaan_da_aaaaaaanan_da_aaak_end_something");
    }),

    it("Composable Dish: Should have top level Dish object", () => {
        assert.ok(Dish);
    }),

    it("Composable Dish: Should construct empty dish object", () => {
        const dish = new Dish();
        assert.deepEqual(dish.value, []);
        assert.strictEqual(dish.type, 0);
    }),

    it("Composable Dish: constructed dish should have operation prototype functions", () => {
        const dish = new Dish();
        assert.ok(dish.translateDateTimeFormat);
        assert.ok(dish.stripHTTPHeaders);
        assert.throws(() => dish.someInvalidFunction());
    }),

    it("Composable Dish: composed function returns another dish", () => {
        const result = new Dish("some input").toBase32();
        assert.ok(result instanceof SyncDish);
    }),

    it("Composable dish: infers type from input if needed", () => {
        const dish = new Dish("string input");
        assert.strictEqual(dish.type, 1);

        const numberDish = new Dish(333);
        assert.strictEqual(numberDish.type, 2);

        const arrayBufferDish = new Dish(Buffer.from("some buffer input").buffer);
        assert.strictEqual(arrayBufferDish.type, 4);

        const JSONDish = new Dish({key: "value"});
        assert.strictEqual(JSONDish.type, 6);
    }),

]);
