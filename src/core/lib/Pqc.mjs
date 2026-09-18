/**
 * @author ResonanceCache
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import r from "jsrsasign";

const PQC_ALGORITHMS = {
    "2.16.840.1.101.3.4.3.17": "ML-DSA-44",
    "2.16.840.1.101.3.4.3.18": "ML-DSA-65",
    "2.16.840.1.101.3.4.3.19": "ML-DSA-87",
    "2.16.840.1.101.3.4.4.1": "ML-KEM-512",
    "2.16.840.1.101.3.4.4.2": "ML-KEM-768",
    "2.16.840.1.101.3.4.4.3": "ML-KEM-1024",
};

/**
 * Gets a standardized PQC algorithm name from an object identifier.
 *
 * @param {string} oid
 * @returns {string|undefined}
 */
export function getPqcAlgorithmName(oid) {
    return PQC_ALGORITHMS[oid];
}

/**
 * Gets the raw SubjectPublicKeyInfo values for a supported PQC public key.
 *
 * @param {r.X509} cert
 * @returns {Object|undefined}
 */
export function getPqcPublicKeyInfo(cert) {
    try {
        const publicKeyInfoHex = cert.getPublicKeyHex(),
            publicKeyInfoChildren = r.ASN1HEX.getChildIdx(publicKeyInfoHex, 0);

        if (publicKeyInfoChildren.length !== 2 ||
            publicKeyInfoHex.slice(0, 2) !== "30" ||
            publicKeyInfoHex.slice(publicKeyInfoChildren[0], publicKeyInfoChildren[0] + 2) !== "30" ||
            publicKeyInfoHex.slice(publicKeyInfoChildren[1], publicKeyInfoChildren[1] + 2) !== "03") {
            return undefined;
        }

        const algorithmChildren = r.ASN1HEX.getChildIdx(publicKeyInfoHex, publicKeyInfoChildren[0]);
        if (!algorithmChildren.length) return undefined;

        const oid = r.ASN1HEX.getOID(publicKeyInfoHex, algorithmChildren[0]),
            algorithm = getPqcAlgorithmName(oid);
        if (!algorithm) return undefined;

        const bitString = r.ASN1HEX.getV(publicKeyInfoHex, publicKeyInfoChildren[1]),
            unusedBits = parseInt(bitString.slice(0, 2), 16),
            publicKeyHex = bitString.slice(2);

        return {
            algorithm,
            oid,
            publicKeyInfoHex,
            publicKeyHex,
            bitLength: publicKeyHex.length * 4 - unusedBits
        };
    } catch {
        return undefined;
    }
}
