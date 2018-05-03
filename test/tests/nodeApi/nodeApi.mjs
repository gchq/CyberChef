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
    })
]);
