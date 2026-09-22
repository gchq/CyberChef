/**
 * @author p-leriche [philip.leriche@cantab.net]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { modPow } from "../lib/BigIntUtils.mjs";

/* ---------- helper functions ---------- */

/**
 * Generate random BigInt with specified bit length
 */
function randBigInt(bits) {
    const bytes = Math.ceil(bits / 8);
    const a = new Uint8Array(bytes);
    crypto.getRandomValues(a);

    // Set high bit to ensure correct bit length
    a[0] |= 1 << (7 - ((8 * bytes - bits)));
    // Set low bit to ensure odd (primes > 2 are odd)
    a[bytes - 1] |= 1;

    let h = "";
    for (const b of a) h += b.toString(16).padStart(2, "0");
    return BigInt("0x" + h);
}

/**
 * Miller-Rabin primality test
 */
function isProbablePrime(n, rounds) {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;

    // Write n-1 as 2^r * d
    let d = n - 1n;
    let r = 0n;
    while (d % 2n === 0n) {
        d /= 2n;
        r++;
    }

    // Witness loop
    for (let i = 0; i < rounds; i++) {
        const a = randBigInt(n.toString(2).length - 1) % (n - 3n) + 2n;
        let x = modPow(a, d, n);

        if (x === 1n || x === n - 1n) continue;

        let composite = true;
        for (let j = 0n; j < r - 1n; j++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) {
                composite = false;
                break;
            }
        }

        if (composite) return false;
    }

    return true;
}

/* ---------- operation class ---------- */

/**
 * Generate Prime Number operation
 */
class GeneratePrime extends Operation {
    /**
     * GeneratePrime constructor
     */
    constructor() {
        super();

        this.name = "Pseudo-Random Prime Generator";
        this.module = "Crypto";
        this.description =
            "Generates a random probable prime number of specified bit length using the Miller-Rabin primality test.<br><br>" +
            "<b>Primality guarantee:</b><br>" +
            "For numbers . 3,317, the result is guaranteed prime (deterministic test).<br>" +
            "For larger numbers, uses probabilistic testing:<br>" +
            "- <b>Standard (7 rounds):</b> Probability of composite approx 1 in 16,000)<br><br>" +
            "- <b>Crypto grade (40 rounds):</b> Probability of composite(approx 1 in 10^24)<br>" +
            "Crypto grade is recommended for cryptographic applications (RSA, Diffie-Hellman, etc.).<br><br>" ;
        this.infoURL = "https://wikipedia.org/wiki/Miller-Rabin_primality_test";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Bit length",
                type: "number",
                value: 512,
                min: 2
            },
            {
                name: "Crypto grade",
                type: "boolean",
                value: false
            },
            {
                name: "Output format",
                type: "option",
                value: ["Decimal", "Hexadecimal"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [bits, cryptoGrade, outputFormat] = args;

        if (bits < 2) {
            throw new OperationError("Bit length must be at least 2");
        }

        if (bits > 4096) {
            throw new OperationError("Bit length limited to 4096 bits for performance reasons");
        }

        const rounds = cryptoGrade ? 40 : 7;
        let attempts = 0;
        const maxAttempts = 10000;

        let n = randBigInt(bits);

        while (!isProbablePrime(n, rounds)) {
            n = randBigInt(bits);
            attempts++;

            if (attempts > maxAttempts) {
                throw new OperationError(`Failed to generate prime after ${maxAttempts} attempts. Try a different bit length.`);
            }
        }

        // Return only the prime for pipeability
        if (outputFormat === "Hexadecimal") {
            return "0x" + n.toString(16);
        } else {
            return n.toString();
        }
    }
}

export default GeneratePrime;
