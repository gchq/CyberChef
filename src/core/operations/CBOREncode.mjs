/**
 * @author Danh4 [dan.h4@ncsc.gov.uk]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Cbor from "cbor";

// cbor v9: Encoder.encode/encodeCanonical return only the first byte.
// Pre-sort map keys ourselves and use a custom Map semantic type so the
// encoder writes keys in insertion order without re-sorting internally.

/**
 * Returns the byte-length of a CBOR-encoded text string key (header + payload).
 * Used to implement RFC 7049 canonical map key ordering.
 *
 * @param {string} s
 * @returns {number}
 */
function cborKeyEncodedLen(s) {
    const n = Buffer.byteLength(s, "utf8");
    if (n < 24)      return 1 + n;
    if (n < 0x100)   return 2 + n;
    if (n < 0x10000) return 3 + n;
    return 5 + n;
}

/**
 * Recursively converts plain objects to pre-sorted Maps so that the CBOR
 * encoder emits keys in canonical (length-first, then lexicographic) order
 * without relying on the cbor library's own canonical sort, which is broken
 * in cbor v9 for streamed output.
 *
 * @param {*} val
 * @returns {*}
 */
function prepareCBOR(val) {
    if (Array.isArray(val)) return val.map(prepareCBOR);
    if (val !== null && typeof val === "object" && !(val instanceof Map)) {
        const sorted = Object.keys(val).sort((a, b) => {
            const la = cborKeyEncodedLen(a), lb = cborKeyEncodedLen(b);
            if (la !== lb) return la - lb;
            return Buffer.from(a, "utf8").compare(Buffer.from(b, "utf8"));
        });
        return new Map(sorted.map(k => [k, prepareCBOR(val[k])]));
    }
    return val;
}

/**
 * Encodes a value as canonical CBOR using a streaming Encoder.
 * Returns a Promise that resolves to a Buffer containing the full encoding.
 *
 * @param {*} input
 * @returns {Promise<Buffer>}
 */
function cborEncodeCanonical(input) {
    return new Promise((resolve, reject) => {
        const enc = new Cbor.Encoder({canonical: true});
        enc.addSemanticType(Map, (e, m) => {
            if (!e._pushInt(m.size, 5)) return false;
            for (const [k, v] of m) {
                if (!e.pushAny(k) || !e.pushAny(v)) return false;
            }
            return true;
        });
        const bufs = [];
        enc.on("data", b => bufs.push(b));
        enc.on("error", reject);
        enc.on("finish", () => resolve(Buffer.concat(bufs)));
        enc.pushAny(prepareCBOR(input));
        enc.end();
    });
}

/**
 * CBOR Encode operation
 */
class CBOREncode extends Operation {

    /**
     * CBOREncode constructor
     */
    constructor() {
        super();

        this.name = "CBOR Encode";
        this.module = "Serialise";
        this.description = "Concise Binary Object Representation (CBOR) is a binary data serialization format loosely based on JSON. Like JSON it allows the transmission of data objects that contain name–value pairs, but in a more concise manner. This increases processing and transfer speeds at the cost of human readability. It is defined in IETF RFC 8949.";
        this.infoURL = "https://wikipedia.org/wiki/CBOR";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        const buf = await cborEncodeCanonical(input);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }

}

export default CBOREncode;
