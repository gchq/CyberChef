/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import GenerateULID from "../../../src/core/operations/GenerateULID.mjs";
import { encodeULID, decodeULID } from "../../../src/core/lib/ULID.mjs";

TestRegister.addApiTests([
    it("ULID: encode every binary bit against an independent integer oracle", () => {
        const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
        for (let bit = 0; bit < 128; bit++) {
            const bytes = new Uint8Array(16);
            bytes[15 - Math.floor(bit / 8)] = 1 << (bit % 8);
            let value = 1n << BigInt(bit), expected = "";
            for (let i = 0; i < 26; i++) {
                expected = alphabet[Number(value % 32n)] + expected;
                value /= 32n;
            }
            assert.strictEqual(encodeULID(bytes), expected);
            assert.deepStrictEqual(decodeULID(expected), [...bytes]);
        }
    }),
    ...[0, 1, 1469922850259, 281474976710655].map(timestamp =>
        it(`ULID: generate at timestamp ${timestamp}`, () => {
            const original = Date.now;
            try {
                Date.now = () => timestamp;
                const encoded = new GenerateULID().run("", []);
                const bytes = decodeULID(encoded);
                const decodedTime = bytes.slice(0, 6).reduce((value, byte) => value * 256 + byte, 0);
                assert.strictEqual(decodedTime, timestamp);
                assert.strictEqual(bytes.length, 16);
                assert.match(encoded, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
            } finally {
                Date.now = original;
            }
        })),
    ...[-1, 0.5, NaN, Infinity, 281474976710656].map(timestamp =>
        it(`ULID: reject invalid timestamp ${timestamp}`, () => {
            const original = Date.now;
            try {
                Date.now = () => timestamp;
                assert.throws(() => new GenerateULID().run("", []), /timestamp must fit in 48 unsigned bits/);
            } finally {
                Date.now = original;
            }
        })),
    it("ULID: invalid inputs throw operation errors", () => {
        assert.throws(() => encodeULID([]), {type: "OperationError"});
        assert.throws(() => decodeULID("8" + "0".repeat(25)), {type: "OperationError"});
        assert.throws(() => decodeULID("0".repeat(25) + "ſ"), {type: "OperationError"});
    })
]);
