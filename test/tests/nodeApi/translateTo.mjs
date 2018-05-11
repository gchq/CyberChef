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
import BigNumber from "bignumber.js";

TestRegister.addApiTests([
    it("should have a translateTo function", () => {
        assert(chef.translateTo);
    }),

    it("should translate to number from string", async () => {
        const hex = await chef.toHex("1");
        const translated = await chef.translateTo(hex, "number");
        assert.equal(31, translated);
    }),

    it("should translate from string to byte array", async () => {
        const str = await chef.toBase32("something");
        const translated = await chef.translateTo(str, "bytearray");
        assert.deepEqual(translated, [79, 78, 88, 87, 50, 90, 76, 85, 78, 66, 85, 87, 52, 90, 89, 61]);
    }),

    it("should convert a number to a big numner", async () => {
        const result = await chef.translateTo(31, "bignumber");
        assert.deepEqual(result, BigNumber(31));
    }),

    it("should be symmetric", async () => {
        const result = await chef.setUnion("1 2 3 4:3 4 5 6", [":", " "]);
        const bytearray = await chef.translateTo(result, "bytearray");
        const translated = await chef.translateTo(bytearray, "string");
        assert.equal(translated, "1 2 3 4 5 6");
    })
]);
