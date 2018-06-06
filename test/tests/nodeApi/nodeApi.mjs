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

import { toBase32 } from "../../../src/node/index";
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
]);
