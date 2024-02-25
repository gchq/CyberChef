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
import it from "../assertionHandler.mjs";
import chef from "../../../src/node/index.mjs";
import {
    OperationError,
    ExcludedOperationError,
} from "../../../src/core/errors/index.mjs";
import NodeDish from "../../../src/node/NodeDish.mjs";

import { toBase32, magic } from "../../../src/node/index.mjs";
import TestRegister from "../../lib/TestRegister.mjs";

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
            sampleDelimiter: ":",
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

    it("should return a NodeDish", async () => {
        const result = chef.toBase32("input");
        assert(result instanceof NodeDish);
    }),

    it("should coerce to a string as you expect", () => {
        const result = chef.fromBase32(chef.toBase32("something"));
        assert.equal(String(result), "something");
        // This kind of coercion uses toValue
        assert.equal("" + result, "NaN");
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
        assert.strictEqual(result[0].name, "Triple DES Decrypt");
        assert.strictEqual(result[0].module, "Ciphers");
        assert.strictEqual(result[0].inputType, "string");
        assert.strictEqual(result[0].outputType, "string");
        assert.strictEqual(
            result[0].description,
            "Triple DES applies DES three times to each block to increase key size.<br><br><b>Key:</b> Triple DES uses a key length of 24 bytes (192 bits).<br>DES uses a key length of 8 bytes (64 bits).<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used as a default.",
        );
        assert.strictEqual(result[0].args.length, 5);
    }),

    it("chef.help: null for invalid operation", () => {
        const result = chef.help("some invalid function name");
        assert.strictEqual(result, null);
    }),

    it("chef.help: takes a wrapped operation as input", () => {
        const result = chef.help(chef.toBase32);
        assert.strictEqual(result[0].name, "To Base32");
        assert.strictEqual(result[0].module, "Default");
    }),

    it("chef.help: returns multiple results", () => {
        const result = chef.help("base 64");
        assert.strictEqual(result.length, 13);
    }),

    it("chef.help: looks in description for matches too", () => {
        // string only in one operation's description.
        const result = chef.help("Converts a unit of data to another format.");
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, "Convert data units");
    }),

    it("chef.help: lists name matches before desc matches", () => {
        const result = chef.help("Checksum");
        assert.ok(result[0].name.includes("Checksum"));
        assert.ok(result[1].name.includes("Checksum"));
        assert.strictEqual(
            result[result.length - 1].name.includes("Checksum"),
            false,
        );
        assert.ok(result[result.length - 1].description.includes("checksum"));
    }),

    it("chef.help: exact name match only returns one result", () => {
        const result = chef.help("MD5");
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, "MD5");
    }),

    it("chef.help: exact match ignores whitespace", () => {
        const result = chef.help("tobase64");
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, "To Base64");
    }),

    it("chef.bake: should exist", () => {
        assert(chef.bake);
    }),

    it("chef.bake: should return NodeDish", () => {
        const result = chef.bake("input", "to base 64");
        assert(result instanceof NodeDish);
    }),

    it("chef.bake: should take an input and an op name and perform it", () => {
        const result = chef.bake("some input", "to base 32");
        assert.strictEqual(result.toString(), "ONXW2ZJANFXHA5LU");
    }),

    it("chef.bake: should complain if recipe isnt a valid object", () => {
        assert.throws(() => chef.bake("some input", 3264), {
            name: "TypeError",
            message: "Recipe can only contain function names or functions",
        });
    }),

    it("chef.bake: Should complain if string op is invalid", () => {
        assert.throws(() => chef.bake("some input", "not a valid operation"), {
            name: "TypeError",
            message:
                "Couldn't find an operation with name 'not a valid operation'.",
        });
    }),

    it("chef.bake: Should take an input and an operation and perform it", () => {
        const result = chef.bake(
            "https://google.com/search?q=help",
            chef.parseURI,
        );
        assert.strictEqual(
            result.toString(),
            "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = help\n",
        );
    }),

    it("chef.bake: Should complain if an invalid operation is inputted", () => {
        assert.throws(
            () => chef.bake("https://google.com/search?q=help", () => {}),
            {
                name: "TypeError",
                message: "Inputted function not a Chef operation.",
            },
        );
    }),

    it("chef.bake: accepts an array of operation names and performs them all in order", () => {
        const result = chef.bake(
            "https://google.com/search?q=that's a complicated question",
            ["URL encode", "URL decode", "Parse URI"],
        );
        assert.strictEqual(
            result.toString(),
            "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = that's a complicated question\n",
        );
    }),

    it("chef.bake: forgiving with operation names", () => {
        const result = chef.bake(
            "https://google.com/search?q=that's a complicated question",
            ["urlencode", "url decode", "parseURI"],
        );
        assert.strictEqual(
            result.toString(),
            "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = that's a complicated question\n",
        );
    }),

    it("chef.bake: forgiving with operation names", () => {
        const result = chef.bake("hello", ["to base 64"]);
        assert.strictEqual(result.toString(), "aGVsbG8=");
    }),

    it("chef.bake: if recipe is empty array, return input as dish", () => {
        const result = chef.bake("some input", []);
        assert.strictEqual(result.toString(), "some input");
        assert(
            result instanceof NodeDish,
            "Result is not instance of NodeDish",
        );
    }),

    it("chef.bake: accepts an array of operations as recipe", () => {
        const result = chef.bake(
            "https://google.com/search?q=that's a complicated question",
            [chef.URLEncode, chef.URLDecode, chef.parseURI],
        );
        assert.strictEqual(
            result.toString(),
            "Protocol:\thttps:\nHostname:\tgoogle.com\nPath name:\t/search\nArguments:\n\tq = that's a complicated question\n",
        );
    }),

    it("should complain if an invalid operation is inputted as part of array", () => {
        assert.throws(() => chef.bake("something", [() => {}]), {
            name: "TypeError",
            message: "Inputted function not a Chef operation.",
        });
    }),

    it("chef.bake: should take single JSON object describing op and args OBJ", () => {
        const result = chef.bake("some input", {
            op: chef.toHex,
            args: {
                Delimiter: "Colon",
            },
        });
        assert.strictEqual(result.toString(), "73:6f:6d:65:20:69:6e:70:75:74");
    }),

    it("chef.bake: should take single JSON object desribing op with optional args", () => {
        const result = chef.bake("some input", {
            op: chef.toHex,
        });
        assert.strictEqual(result.toString(), "73 6f 6d 65 20 69 6e 70 75 74");
    }),

    it("chef.bake: should take single JSON object describing op and args ARRAY", () => {
        const result = chef.bake("some input", {
            op: chef.toHex,
            args: ["Colon"],
        });
        assert.strictEqual(result.toString(), "73:6f:6d:65:20:69:6e:70:75:74");
    }),

    it("chef.bake: should error if op in JSON is not chef op", () => {
        assert.throws(
            () =>
                chef.bake("some input", {
                    op: () => {},
                    args: ["Colon"],
                }),
            {
                name: "TypeError",
                message: "Inputted function not a Chef operation.",
            },
        );
    }),

    it("chef.bake: should take multiple ops in JSON object form, some ops by string", () => {
        const result = chef.bake("some input", [
            {
                op: chef.toHex,
                args: ["Colon"],
            },
            {
                op: "to octal",
                args: {
                    delimiter: "Semi-colon",
                },
            },
        ]);
        assert.strictEqual(
            result.toString(),
            "67;63;72;66;146;72;66;144;72;66;65;72;62;60;72;66;71;72;66;145;72;67;60;72;67;65;72;67;64",
        );
    }),

    it("chef.bake: should take multiple ops in JSON object form, some without args", () => {
        const result = chef.bake("some input", [
            {
                op: chef.toHex,
            },
            {
                op: "to octal",
                args: {
                    delimiter: "Semi-colon",
                },
            },
        ]);
        assert.strictEqual(
            result.toString(),
            "67;63;40;66;146;40;66;144;40;66;65;40;62;60;40;66;71;40;66;145;40;67;60;40;67;65;40;67;64",
        );
    }),

    it("chef.bake: should handle op with multiple args", () => {
        const result = chef.bake("some input", {
            op: "to morse code",
            args: {
                formatOptions: "Dash/Dot",
                wordDelimiter: "Comma",
                letterDelimiter: "Backslash",
            },
        });
        assert.strictEqual(
            result.toString(),
            "DotDotDot\\DashDashDash\\DashDash\\Dot,DotDot\\DashDot\\DotDashDashDot\\DotDotDash\\Dash",
        );
    }),

    it("chef.bake: should take compact JSON format from Chef Website as recipe", () => {
        const result = chef.bake("some input", [
            { op: "To Morse Code", args: ["Dash/Dot", "Backslash", "Comma"] },
            { op: "Hex to PEM", args: ["SOMETHING"] },
            { op: "To Snake case", args: [false] },
        ]);
        assert.strictEqual(
            result.toString(),
            "begin_something_anananaaaaak_da_aaak_da_aaaaananaaaaaaan_da_aaaaaaanan_da_aaak_end_something",
        );
    }),

    it("chef.bake: should accept Clean JSON format from Chef website as recipe", () => {
        const result = chef.bake("some input", [
            { op: "To Morse Code", args: ["Dash/Dot", "Backslash", "Comma"] },
            { op: "Hex to PEM", args: ["SOMETHING"] },
            { op: "To Snake case", args: [false] },
        ]);
        assert.strictEqual(
            result.toString(),
            "begin_something_anananaaaaak_da_aaak_da_aaaaananaaaaaaan_da_aaaaaaanan_da_aaak_end_something",
        );
    }),

    it("chef.bake: should accept Clean JSON format from Chef website - args optional", () => {
        const result = chef.bake("some input", [
            { op: "To Morse Code" },
            { op: "Hex to PEM", args: ["SOMETHING"] },
            { op: "To Snake case", args: [false] },
        ]);
        assert.strictEqual(
            result.toString(),
            "begin_something_aaaaaaaaaaaaaa_end_something",
        );
    }),

    it("chef.bake: cannot accept flowControl operations in recipe", () => {
        assert.throws(() => chef.bake("some input", "magic"), {
            name: "TypeError",
            message:
                "flowControl operations like Magic are not currently allowed in recipes for chef.bake in the Node API",
        });
        assert.throws(() => chef.bake("some input", magic), {
            name: "TypeError",
            message:
                "flowControl operations like Magic are not currently allowed in recipes for chef.bake in the Node API",
        });
        assert.throws(() => chef.bake("some input", ["to base 64", "magic"]), {
            name: "TypeError",
            message:
                "flowControl operations like Magic are not currently allowed in recipes for chef.bake in the Node API",
        });
    }),

    it("Excluded operations: throw a sensible error when you try and call one", () => {
        assert.throws(
            chef.fork,
            (err) => {
                assert(err instanceof ExcludedOperationError);
                assert.deepEqual(
                    err.message,
                    "Sorry, the Fork operation is not available in the Node.js version of CyberChef.",
                );
                return true;
            },
            "Unexpected error type",
        );
        assert.throws(
            chef.javaScriptBeautify,
            (err) => {
                assert(err instanceof ExcludedOperationError);
                assert.deepEqual(
                    err.message,
                    "Sorry, the JavaScriptBeautify operation is not available in the Node.js version of CyberChef.",
                );
                return true;
            },
            "Unexpected error type",
        );
    }),

    it("Operation arguments: should be accessible from operation object if op has array arg", () => {
        assert.ok(chef.toCharcode.args);
        assert.deepEqual(chef.unzip.args, {
            password: {
                type: "binaryString",
                value: "",
            },
            verifyResult: {
                type: "boolean",
                value: false,
            },
        });
    }),

    it("Operation arguments: should have key for each argument in operation", () => {
        assert.ok(chef.convertDistance.args.inputUnits);
        assert.ok(chef.convertDistance.args.outputUnits);

        assert.strictEqual(chef.bitShiftRight.args.amount.type, "number");
        assert.strictEqual(chef.bitShiftRight.args.amount.value, 1);
        assert.strictEqual(chef.bitShiftRight.args.type.type, "option");
        assert.ok(Array.isArray(chef.bitShiftRight.args.type.options));
    }),

    it("Operation arguments: should list all options excluding subheadings", () => {
        // First element (subheading) removed
        assert.equal(
            chef.convertDistance.args.inputUnits.options[0],
            "Nanometres (nm)",
        );
        assert.equal(chef.defangURL.args.process.options[1], "Only full URLs");
    }),
]);
