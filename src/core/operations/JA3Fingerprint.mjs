/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 *
 * JA3 created by Salesforce
 *   John B. Althouse
 *   Jeff Atkinson
 *   Josh Atkins
 *
 * Algorithm released under the BSD-3-clause licence
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import Stream from "../lib/Stream.mjs";
import { runHash } from "../lib/Hash.mjs";

/**
 * JA3 Fingerprint operation
 */
class JA3Fingerprint extends Operation {
    /**
     * JA3Fingerprint constructor
     */
    constructor() {
        super();

        this.name = "JA3 Fingerprint";
        this.module = "Crypto";
        this.description
            = "Generates a JA3 fingerprint to help identify TLS clients based on hashing together values from the Client Hello.<br><br>Input: A hex stream of the TLS Client Hello packet application layer.";
        this.infoURL = "https://engineering.salesforce.com/tls-fingerprinting-with-ja3-and-ja3s-247362855967";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "Base64", "Raw"]
            },
            {
                name: "Output format",
                type: "option",
                value: ["Hash digest", "JA3 string", "Full details"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat, outputFormat] = args;

        input = Utils.convertToByteArray(input, inputFormat);
        const s = new Stream(new Uint8Array(input));

        const handshake = s.readInt(1);
        if (handshake !== 0x16) throw new OperationError("Not handshake data.");

        // Version
        s.moveForwardsBy(2);

        // Length
        const length = s.readInt(2);
        if (s.length !== length + 5) throw new OperationError("Incorrect handshake length.");

        // Handshake type
        const handshakeType = s.readInt(1);
        if (handshakeType !== 1) throw new OperationError("Not a Client Hello.");

        // Handshake length
        const handshakeLength = s.readInt(3);
        if (s.length !== handshakeLength + 9) throw new OperationError("Not enough data in Client Hello.");

        // Hello version
        const helloVersion = s.readInt(2);

        // Random
        s.moveForwardsBy(32);

        // Session ID
        const sessionIDLength = s.readInt(1);
        s.moveForwardsBy(sessionIDLength);

        // Cipher suites
        const cipherSuitesLength = s.readInt(2);
        const cipherSuites = s.getBytes(cipherSuitesLength);
        const cs = new Stream(cipherSuites);
        const cipherSegment = parseJA3Segment(cs, 2);

        // Compression Methods
        const compressionMethodsLength = s.readInt(1);
        s.moveForwardsBy(compressionMethodsLength);

        // Extensions
        const extensionsLength = s.readInt(2);
        const extensions = s.getBytes(extensionsLength);
        const es = new Stream(extensions);
        let ecsLen,
            ecs,
            ellipticCurves = "",
            ellipticCurvePointFormats = "";
        const exts = [];
        while (es.hasMore()) {
            const type = es.readInt(2);
            const length = es.readInt(2);
            switch (type) {
                case 0x0a: // Elliptic curves
                    ecsLen = es.readInt(2);
                    ecs = new Stream(es.getBytes(ecsLen));
                    ellipticCurves = parseJA3Segment(ecs, 2);
                    break;
                case 0x0b: // Elliptic curve point formats
                    ecsLen = es.readInt(1);
                    ecs = new Stream(es.getBytes(ecsLen));
                    ellipticCurvePointFormats = parseJA3Segment(ecs, 1);
                    break;
                default:
                    es.moveForwardsBy(length);
            }
            if (!GREASE_CIPHERSUITES.includes(type)) exts.push(type);
        }

        // Output
        const ja3 = [helloVersion.toString(), cipherSegment, exts.join("-"), ellipticCurves, ellipticCurvePointFormats];
        const ja3Str = ja3.join(",");
        const ja3Hash = runHash("md5", Utils.strToArrayBuffer(ja3Str));

        switch (outputFormat) {
            case "JA3 string":
                return ja3Str;
            case "Full details":
                return `Hash digest:
${ja3Hash}

Full JA3 string:
${ja3Str}

TLS Version:
${helloVersion.toString()}
Cipher Suites:
${cipherSegment}
Extensions:
${exts.join("-")}
Elliptic Curves:
${ellipticCurves}
Elliptic Curve Point Formats:
${ellipticCurvePointFormats}`;
            case "Hash digest":
            default:
                return ja3Hash;
        }
    }
}

/**
 * Parses a JA3 segment, returning a "-" separated list
 *
 * @param {Stream} stream
 * @returns {string}
 */
function parseJA3Segment(stream, size = 2) {
    const segment = [];
    while (stream.hasMore()) {
        const element = stream.readInt(size);
        if (!GREASE_CIPHERSUITES.includes(element)) segment.push(element);
    }
    return segment.join("-");
}

const GREASE_CIPHERSUITES = [
    0x0a0a, 0x1a1a, 0x2a2a, 0x3a3a, 0x4a4a, 0x5a5a, 0x6a6a, 0x7a7a, 0x8a8a, 0x9a9a, 0xaaaa, 0xbaba, 0xcaca, 0xdada,
    0xeaea, 0xfafa
];

export default JA3Fingerprint;
