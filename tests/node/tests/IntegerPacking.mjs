/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import PackIntegers from "../../../src/core/operations/PackIntegers.mjs";
import UnpackIntegers from "../../../src/core/operations/UnpackIntegers.mjs";
import chef from "../../../src/node/index.mjs";

TestRegister.addApiTests([
    ...["Big endian", "Little endian"].map(endian =>
        it(`Integer packing: 64-bit bytes agree with DataView in ${endian}`, () => {
            const values = [0n, 1n, 255n, 65536n, 9007199254740993n, (1n << 63n) - 1n, 1n << 63n, (1n << 64n) - 1n];
            const expected = new ArrayBuffer(values.length * 8);
            const view = new DataView(expected);
            values.forEach((value, index) => view.setBigUint64(index * 8, value, endian === "Little endian"));
            const actual = new PackIntegers().run(values.join(","), ["64", ",", "Raw", endian]);
            assert.deepStrictEqual(new Uint8Array(actual), new Uint8Array(expected));
            assert.strictEqual(new UnpackIntegers().run(expected, ["64", false, ",", "Raw", endian]), values.join(","));
        })),
    ...[8, 24, 128, 4096].map(bits =>
        it(`Integer packing: exact ${bits}-bit signed and unsigned boundaries`, () => {
            const minimum = -(1n << BigInt(bits - 1));
            const maximum = (1n << BigInt(bits)) - 1n;
            const pack = new PackIntegers(), unpack = new UnpackIntegers();
            for (const endian of ["Big endian", "Little endian"]) {
                const packed = pack.run(`${minimum},-1,0,1`, [String(bits), ",", "Raw", endian]);
                assert.strictEqual(unpack.run(packed, [String(bits), true, ",", "Raw", endian]), `${minimum},-1,0,1`);
                const unsigned = pack.run(maximum.toString(), [String(bits), ",", "Raw", endian]);
                assert.deepStrictEqual([...new Uint8Array(unsigned)], Array(bits / 8).fill(255));
                assert.strictEqual(unpack.run(unsigned, [String(bits), false, ",", "Raw", endian]), maximum.toString());
            }
            assert.throws(() => pack.run((minimum - 1n).toString(), [String(bits), ",", "Raw", "Big endian"]), {type: "OperationError"});
            assert.throws(() => pack.run((maximum + 1n).toString(), [String(bits), ",", "Raw", "Big endian"]), {type: "OperationError"});
        })),
    it("Integer packing: an operation can switch output format between runs", () => {
        const pack = new PackIntegers();
        assert.strictEqual(pack.run("255", ["8", ",", "Hex", "Big endian"]), "ff");
        assert.strictEqual(pack.outputType, "string");
        assert.strictEqual(pack.presentType, "string");
        assert.deepStrictEqual(new Uint8Array(pack.run("255", ["8", ",", "Raw", "Big endian"])), new Uint8Array([255]));
        assert.strictEqual(pack.outputType, "ArrayBuffer");
        assert.strictEqual(pack.presentType, "ArrayBuffer");
    }),
    it("Integer packing: Node recipe retains binary values above 127", async () => {
        const result = await chef.bake("0,255,128", [
            {op: "Pack Integers", args: ["8", ",", "Raw", "Big endian"]},
            {op: "Unpack Integers", args: ["8", false, ",", "Raw", "Big endian"]}
        ]);
        assert.strictEqual(result.toString(), "0,255,128");
    }),
    it("Integer packing: oversized outputs are rejected before allocation", () => {
        const input = Array(131073).fill("0").join(",");
        assert.throws(() => new PackIntegers().run(input, ["4096", ",", "Raw", "Big endian"]), /must not exceed 64 MiB/);
    })
]);
