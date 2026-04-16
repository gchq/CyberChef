/**
 * @author ko80240 [csk.dev@proton.me]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import * as uuid from "uuid";

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * Analyse UUID operation
 */
class AnalyseUUID extends Operation {

    /**
     * AnalyseUUID constructor
     */
    constructor() {
        super();

        this.name = "Analyse UUID";
        this.module = "Crypto";
        this.description = "Operation for extracting metadata and detecting the version of a given UUID.";
        this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Include Metadata",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {string} input - Expects a valid UUID string
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        input = input.trim();

        let uuidVersion, uuidBytes;
        try {
            uuidVersion = uuid.version(input); // Re-using the uuid library to extract version
            uuidBytes = uuid.parse(input);     // Re-using the uuid library to parse bytes
        } catch (error) {
            throw new OperationError("Invalid UUID");
        }

        const [includeMetadata] = args;
        const dv = new DataView(uuidBytes.buffer, uuidBytes.byteOffset, uuidBytes.byteLength); // Dataview helps handle the multi-byte ints
        const uuidInteger = (dv.getBigUint64(0) << 64n) | dv.getBigUint64(8);

        const sections = [`Version:\n${uuidVersion}`];

        if (includeMetadata) {
            const parser = UUID_PARSERS[uuidVersion];
            const decoded = parser?.(uuidBytes, dv);
            sections.push(formatDecoded(decoded));
        }

        sections.push(`UUID Integer:\n${uuidInteger}`);

        return sections.filter(Boolean).join("\n\n");
    }
}

export default AnalyseUUID;

/**
 * Metadata can be extracted for versions 1, 6, and 7.
 * Enum-like frozen mapping of UUID version to parser function.
 */
const UUID_PARSERS = Object.freeze({
    1: parsev1v6,
    6: parsev1v6,
    7: parsev7,
});

/**
 * Versions 1 and 6. Note 6 is a re-order of 1.
 * Version 1 == layout: timeLow(32) | timeMid(16) | timeHi(12)
 * Version 6 == layout: timeHi(32)  | timeMid(16) | timeLow(12)
 */
function parsev1v6(uuidBytes, dv) {
    const isV1 = (uuidBytes[6] >> 4) === 1;

    const timeStamp =
        isV1 ? (
            (BigInt(dv.getUint16(6) & 0x0fff) << 48n) | // mask off version bits
            (BigInt(dv.getUint16(4)) << 32n) |
            BigInt(dv.getUint32(0))
        ) : (
            (BigInt(dv.getUint32(0)) << 28n) |
            (BigInt(dv.getUint16(4)) << 12n) |
            (BigInt(dv.getUint16(6) & 0x0fff))
        );

    // Convert to Unix time
    const milliseconds =
        Number(
            (timeStamp - 122192928000000000n) / 10000n
        );

    return {
        timestamp: milliseconds,
        isoTimestamp: new Date(milliseconds).toISOString(),
        clock: ((uuidBytes[8] & 0x3f) << 8) | uuidBytes[9],
        node: toHex(uuidBytes.slice(10), ":").toUpperCase()
    };
}

/** Version 7 */
function parsev7(uuidBytes, dv) {
    const milliseconds = Number((BigInt(dv.getUint32(0)) << 16n) | BigInt(dv.getUint16(4)));

    return {
        timestamp: milliseconds,
        isoTimestamp: new Date(milliseconds).toISOString(),
        randA: ((uuidBytes[6] & 0x0f) << 8) | uuidBytes[7],
        randB: toHex(uuidBytes.slice(8), "").toUpperCase()
    };
}

/**
 * Formats metadata
 *
 * @param {Object|undefined} decoded
 * @returns {string}
 */
function formatDecoded(decoded) {
    if (!decoded) return "No metadata available. Only versions 1, 6, 7 are supported.";

    return Object.entries({
        "Timestamp": decoded.timestamp,
        "Timestamp (ISO)": decoded.isoTimestamp,
        "Node": decoded.node,
        "Clock": decoded.clock,
        "Rand A": decoded.randA,
        "Rand B": decoded.randB
    })
        .filter(([, value]) => value !== undefined)
        .map(([label, value]) => `${label}:\n${value}`)
        .join("\n\n");
}
