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
import TestRegister from "../../TestRegister";

TestRegister.addApiTests([
    it("should have some operations", () => {
        assert(chef);
        assert(chef.toBase32);
        assert(chef.setUnion);
        assert(!chef.randomFunction);
    }),

    it("should have an async/await api", async () => {
        try {
            const result = await chef.toBase32("input");
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

    it("should have a callback API", async () => {
        await chef.toBase32("something", (err, result) => {
            if (err) {
                assert(false);
            } else {
                assert.equal("ONXW2ZLUNBUW4ZY=", result);
            }
        });
    }),

    it("should handle errors in callback API", async () => {
        await chef.setUnion("1", (err, result) => {
            if (err) {
                assert(true);
                return;
            }
            assert(false);
        });
    }),

    it("should accept arguments in object format for operations", async () => {
        const result = await chef.setUnion("1 2 3 4:3 4 5 6", {
            itemDelimiter: " ",
            sampleDelimiter: ":"
        });

        assert.equal(result, "1 2 3 4 5 6");
    }),

    it("should accept just some of the optional arguments being overriden", async () => {
        const result = await chef.setIntersection("1 2 3 4 5\\n\\n3 4 5", {
            itemDelimiter: " ",
        });

        assert.equal(result, "3 4 5");
    }),

    it("should accept no override arguments and just use the default values", async () => {
        const result = await chef.powerSet("1,2,3");
        assert.equal(result, "\n3\n2\n1\n2,3\n1,3\n1,2\n1,2,3\n");
    })
]);
