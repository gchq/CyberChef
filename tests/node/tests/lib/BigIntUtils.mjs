import TestRegister from "../../../lib/TestRegister.mjs";
import { parseBigInt, egcd, modPow } from "../../../../src/core/lib/BigIntUtils.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    // ===== parseBigInt tests =====
    it("BigIntUtils: parseBigInt - decimal number", () => {
        const value = parseBigInt("1", "test value");
        assert.deepStrictEqual(value, BigInt("1"));
    }),
    
    it("BigIntUtils: parseBigInt - large decimal", () => {
        const value = parseBigInt("123456789012345678901234567890", "test value");
        assert.deepStrictEqual(value, BigInt("123456789012345678901234567890"));
    }),
    
    it("BigIntUtils: parseBigInt - hexadecimal lowercase", () => {
        const value = parseBigInt("0xff", "test value");
        assert.deepStrictEqual(value, BigInt("255"));
    }),
    
    it("BigIntUtils: parseBigInt - hexadecimal uppercase", () => {
        const value = parseBigInt("0xFF", "test value");
        assert.deepStrictEqual(value, BigInt("255"));
    }),
    
    it("BigIntUtils: parseBigInt - large hexadecimal", () => {
        const value = parseBigInt("0x123456789ABCDEF", "test value");
        assert.deepStrictEqual(value, BigInt("0x123456789ABCDEF"));
    }),
    
    it("BigIntUtils: parseBigInt - whitespace trimming", () => {
        const value = parseBigInt("  42  ", "test value");
        assert.deepStrictEqual(value, BigInt("42"));
    }),
    
    it("BigIntUtils: parseBigInt - invalid input (text)", () => {
        assert.throws(() => parseBigInt("test", "test value"), {
            name: "Error",
            message: "test value must be decimal or hex (0x...)"
        });
    }),
    
    it("BigIntUtils: parseBigInt - invalid input (hex without prefix)", () => {
        assert.throws(() => parseBigInt("FF", "test value"), {
            name: "Error",
            message: "test value must be decimal or hex (0x...)"
        });
    }),
    
    it("BigIntUtils: parseBigInt - invalid input (mixed)", () => {
        assert.throws(() => parseBigInt("12abc", "test value"), {
            name: "Error",
            message: "test value must be decimal or hex (0x...)"
        });
    }),

    // ===== egcd tests =====
    it("BigIntUtils: egcd - basic coprime", () => {
        const a = BigInt("36");
        const b = BigInt("48");
        const gcd = BigInt("12");
        const bezout1 = BigInt("-1");
        const bezout2 = BigInt("1");
        assert.deepStrictEqual(egcd(a, b), [gcd, bezout1, bezout2]);
    }),
    
    it("BigIntUtils: egcd - coprime numbers", () => {
        const [g, x, y] = egcd(BigInt("3"), BigInt("11"));
        assert.strictEqual(g, BigInt("1"));
        // Verify Bézout identity: a*x + b*y = gcd
        assert.strictEqual(BigInt("3") * x + BigInt("11") * y, g);
    }),
    
    it("BigIntUtils: egcd - non-coprime numbers", () => {
        const [g, x, y] = egcd(BigInt("240"), BigInt("46"));
        assert.strictEqual(g, BigInt("2"));
        // Verify Bézout identity
        assert.strictEqual(BigInt("240") * x + BigInt("46") * y, g);
    }),
    
    it("BigIntUtils: egcd - with zero", () => {
        const [g, x, y] = egcd(BigInt("17"), BigInt("0"));
        assert.strictEqual(g, BigInt("17"));
        assert.strictEqual(x, BigInt("1"));
        assert.strictEqual(y, BigInt("0"));
    }),
    
    it("BigIntUtils: egcd - identical numbers", () => {
        const [g, x, y] = egcd(BigInt("42"), BigInt("42"));
        assert.strictEqual(g, BigInt("42"));
        // Verify Bézout identity
        assert.strictEqual(BigInt("42") * x + BigInt("42") * y, g);
    }),
    
    it("BigIntUtils: egcd - large numbers", () => {
        const a = BigInt("123456789012345678901234567890");
        const b = BigInt("987654321098765432109876543210");
        const [g, x, y] = egcd(a, b);
        // Verify Bézout identity
        assert.strictEqual(a * x + b * y, g);
    }),

    // ===== modPow tests =====
    it("BigIntUtils: modPow - basic", () => {
        // 2^10 mod 1000 = 1024 mod 1000 = 24
        const result = modPow(BigInt("2"), BigInt("10"), BigInt("1000"));
        assert.strictEqual(result, BigInt("24"));
    }),
    
    it("BigIntUtils: modPow - RSA-like example", () => {
        // Common RSA public exponent
        const base = BigInt("123456789");
        const exp = BigInt("65537");
        const mod = BigInt("999999999999");
        const result = modPow(base, exp, mod);
        // Result should be less than modulus
        assert(result < mod);
        assert(result >= BigInt("0"));
    }),
    
    it("BigIntUtils: modPow - exponent zero", () => {
        // Any number^0 = 1
        const result = modPow(BigInt("999"), BigInt("0"), BigInt("100"));
        assert.strictEqual(result, BigInt("1"));
    }),
    
    it("BigIntUtils: modPow - base zero", () => {
        // 0^n = 0
        const result = modPow(BigInt("0"), BigInt("5"), BigInt("100"));
        assert.strictEqual(result, BigInt("0"));
    }),
    
    it("BigIntUtils: modPow - large exponent", () => {
        // Test with very large exponent (efficient algorithm should handle this)
        const result = modPow(BigInt("3"), BigInt("1000000"), BigInt("1000000007"));
        assert(result >= BigInt("0"));
        assert(result < BigInt("1000000007"));
    }),
    
    it("BigIntUtils: modPow - modular inverse verification", () => {
        // If a*x . 1 (mod m), then modPow(a, 1, m) * x . 1 (mod m)
        const a = BigInt("3");
        const m = BigInt("11");
        const x = BigInt("4"); // inverse of 3 mod 11
        const result = modPow(a, BigInt("1"), m) * x % m;
        assert.strictEqual(result, BigInt("1"));
    }),
]);
