/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import "reflect-metadata"; // Required as a shim for the amf library
import { AMF0 } from "@astronautlabs/amf";

const AMF3_MARKER = {
    Null: 0x01,
    False: 0x02,
    True: 0x03,
    Double: 0x05,
    String: 0x06,
    Array: 0x09,
    Object: 0x0a
};

/**
 * @param {number} value
 * @returns {number[]}
 */
function encodeU29(value) {
    if (value < 0x80) {
        return [value];
    }
    if (value < 0x4000) {
        return [
            ((value >> 7) & 0x7f) | 0x80,
            value & 0x7f
        ];
    }
    if (value < 0x200000) {
        return [
            ((value >> 14) & 0x7f) | 0x80,
            ((value >> 7) & 0x7f) | 0x80,
            value & 0x7f
        ];
    }
    return [
        ((value >> 22) & 0x7f) | 0x80,
        ((value >> 15) & 0x7f) | 0x80,
        ((value >> 8) & 0x7f) | 0x80,
        value & 0xff
    ];
}

/**
 * @param {string} value
 * @returns {number[]}
 */
function encodeAMF3Utf8(value) {
    const bytes = Utils.strToUtf8ByteArray(value);
    return encodeU29((bytes.length << 1) | 1).concat(bytes);
}

/**
 * @param {number} value
 * @returns {number[]}
 */
function encodeAMF3Double(value) {
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setFloat64(0, value, false);
    return [AMF3_MARKER.Double].concat(Array.from(bytes));
}

/**
 * @param {JSON} value
 * @returns {number[]}
 */
function encodeAMF3Value(value) {
    if (value === null) return [AMF3_MARKER.Null];
    if (value === false) return [AMF3_MARKER.False];
    if (value === true) return [AMF3_MARKER.True];
    if (typeof value === "number") return encodeAMF3Double(value);
    if (typeof value === "string") return [AMF3_MARKER.String].concat(encodeAMF3Utf8(value));

    if (Array.isArray(value)) {
        return [
            AMF3_MARKER.Array,
            ...encodeU29((value.length << 1) | 1),
            0x01,
            ...value.flatMap(encodeAMF3Value)
        ];
    }

    const keys = Object.keys(value);
    return [
        AMF3_MARKER.Object,
        ...encodeU29((keys.length << 4) | 0x03),
        0x01,
        ...keys.flatMap(encodeAMF3Utf8),
        ...keys.flatMap(key => encodeAMF3Value(value[key]))
    ];
}

/**
 * AMF Encode operation
 */
class AMFEncode extends Operation {

    /**
     * AMFEncode constructor
     */
    constructor() {
        super();

        this.name = "AMF Encode";
        this.module = "Encodings";
        this.description = "Action Message Format (AMF) is a binary format used to serialize object graphs such as ActionScript objects and XML, or send messages between an Adobe Flash client and a remote service, usually a Flash Media Server or third party alternatives.";
        this.infoURL = "https://wikipedia.org/wiki/Action_Message_Format";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Format",
                type: "option",
                value: ["AMF0", "AMF3"],
                defaultIndex: 1
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [format] = args;
        const output = format === "AMF0" ?
            AMF0.Value.any(input).serialize() :
            Uint8Array.from(encodeAMF3Value(input));
        return output.buffer;
    }

}

export default AMFEncode;
