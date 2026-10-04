/**
 * PQC helper tests.
 *
 * @author ResonanceCache
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import it from "../assertionHandler.mjs";
import TestRegister from "../../lib/TestRegister.mjs";
import { getPqcAlgorithmName, getPqcPublicKeyInfo } from "../../../src/core/lib/Pqc.mjs";

const ML_DSA_44_SPKI = "3014300b0609608648016503040311030500aabbccdd";

TestRegister.addApiTests([
    it("recognises standardized PQC algorithm OIDs", () => {
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.3.17"), "ML-DSA-44");
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.3.18"), "ML-DSA-65");
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.3.19"), "ML-DSA-87");
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.4.1"), "ML-KEM-512");
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.4.2"), "ML-KEM-768");
        assert.strictEqual(getPqcAlgorithmName("2.16.840.1.101.3.4.4.3"), "ML-KEM-1024");
    }),
    it("extracts PQC SubjectPublicKeyInfo values", () => {
        const publicKeyInfo = getPqcPublicKeyInfo({
            getPublicKeyHex: () => ML_DSA_44_SPKI
        });

        assert.deepStrictEqual(publicKeyInfo, {
            algorithm: "ML-DSA-44",
            oid: "2.16.840.1.101.3.4.3.17",
            publicKeyInfoHex: ML_DSA_44_SPKI,
            publicKeyHex: "aabbccdd",
            bitLength: 32
        });
    }),
    it("rejects malformed SubjectPublicKeyInfo values", () => {
        const publicKeyInfo = getPqcPublicKeyInfo({
            getPublicKeyHex: () => "3000"
        });

        assert.strictEqual(publicKeyInfo, undefined);
    })
]);
