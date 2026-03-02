import TestRegister from "../../../lib/TestRegister.mjs";
import { parseBigInt, egcd } from "../../../../src/core/lib/BigIntUtils.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    it("BigIntUtils: egcd - basic", () => {
        const a = BigInt("36");
        const b = BigInt("48");
        const gcd = BigInt("12");
        const bezout1 = BigInt("-1");
        const bezout2 = BigInt("1");
        assert.deepStrictEqual(egcd(a, b), [gcd, bezout1, bezout2]);
    }),

    it("BigIntUtils: parseBigInt - basic", () => {
        const value = parseBigInt("1", "test value");

        assert.deepStrictEqual(value, BigInt("1"));
    }),

    it("BigIntUtils: parseBigInt - not an int", () => {
        assert.throws(() => parseBigInt("test", "test value"), {
            name: "Error",
            message: "test value must be decimal or hex (0x...)"
        });
    }),
]);
