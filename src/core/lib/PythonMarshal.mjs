/**
 * @author GCHQ
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

const FLAG_REF = 0x80;
const MAX_ITEMS = 1000000;
const MAX_DEPTH = 1000;
const NULL = Symbol("marshal null");

const TYPE = {
    NULL: 0x30,
    NONE: 0x4e,
    FALSE: 0x46,
    TRUE: 0x54,
    STOPITER: 0x53,
    ELLIPSIS: 0x2e,
    INT: 0x69,
    INT64: 0x49,
    FLOAT: 0x66,
    BINARY_FLOAT: 0x67,
    COMPLEX: 0x78,
    BINARY_COMPLEX: 0x79,
    LONG: 0x6c,
    STRING: 0x73,
    INTERNED: 0x74,
    STRINGREF: 0x52,
    TUPLE: 0x28,
    SMALL_TUPLE: 0x29,
    LIST: 0x5b,
    DICT: 0x7b,
    CODE: 0x63,
    UNICODE: 0x75,
    SET: 0x3c,
    FROZENSET: 0x3e,
    ASCII: 0x61,
    ASCII_INTERNED: 0x41,
    SHORT_ASCII: 0x7a,
    SHORT_ASCII_INTERNED: 0x5a,
    REF: 0x72,
};

const textDecoder = new TextDecoder("utf-8", { fatal: true });
const textEncoder = new TextEncoder();

/**
 * Python marshal format codec for values expressible in JSON.
 */
class PythonMarshal {

    /**
     * @param {ArrayBuffer} input
     * @returns {Object|Array|string|number|boolean|null}
     */
    static decode(input) {
        const reader = new Reader(new Uint8Array(input));
        if (!reader.bytes.length) throw new OperationError("Python marshal input is empty");

        const value = reader.readValue(0);
        if (value === NULL) throw new OperationError("Unexpected null marker in Python marshal input");
        try {
            JSON.stringify(value);
        } catch (err) {
            throw new OperationError("Python marshal data contains a cyclic value, which is not representable as JSON");
        }
        return value;
    }

    /**
     * @param {Object|Array|string|number|boolean|null} value
     * @returns {ArrayBuffer}
     */
    static encode(value) {
        const writer = new Writer();
        writer.writeValue(value, 0);
        return writer.finish();
    }

}

/**
 * Parses a Python marshal byte stream into JSON-compatible values.
 *
 * The reader tracks its position and marshal reference table while rejecting
 * unsupported Python-only types, malformed references and oversized values.
 */
class Reader {

    /**
     * @param {Uint8Array} bytes
     */
    constructor(bytes) {
        this.bytes = bytes;
        this.position = 0;
        this.refs = [];
    }

    /**
     * @param {number} length
     * @returns {Uint8Array}
     */
    readBytes(length) {
        if (!Number.isSafeInteger(length) || length < 0 || length > this.bytes.length - this.position) {
            throw new OperationError("Unexpected end of Python marshal input");
        }
        const start = this.position;
        this.position += length;
        return this.bytes.subarray(start, this.position);
    }

    /**
     * @returns {number}
     */
    readUint8() {
        return this.readBytes(1)[0];
    }

    /**
     * @returns {number}
     */
    readInt32() {
        const bytes = this.readBytes(4);
        return new DataView(bytes.buffer, bytes.byteOffset, 4).getInt32(0, true);
    }

    /**
     * @returns {number}
     */
    readUint32() {
        const bytes = this.readBytes(4);
        return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
    }

    /**
     * @returns {number}
     */
    readFloat64() {
        const bytes = this.readBytes(8);
        return new DataView(bytes.buffer, bytes.byteOffset, 8).getFloat64(0, true);
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {string}
     */
    decodeText(bytes) {
        try {
            return textDecoder.decode(bytes);
        } catch (err) {
            throw new OperationError("Python marshal string is not valid UTF-8");
        }
    }

    /**
     * @param {number} depth
     * @returns {Object|Array|string|number|boolean|null|symbol}
     */
    readValue(depth) {
        if (depth > MAX_DEPTH) throw new OperationError("Python marshal data is nested too deeply");

        const typeWithFlags = this.readUint8();
        const type = typeWithFlags & ~FLAG_REF;
        const shouldStoreReference = (typeWithFlags & FLAG_REF) !== 0;
        const referenceIndex = shouldStoreReference ? this.refs.length : -1;
        let value;

        if (shouldStoreReference && (type === TYPE.LIST || type === TYPE.TUPLE || type === TYPE.SMALL_TUPLE || type === TYPE.SET || type === TYPE.FROZENSET)) {
            value = [];
            this.refs.push(value);
            this.readSequence(value, type === TYPE.SMALL_TUPLE ? this.readUint8() : this.readUint32(), depth);
            return value;
        }
        if (shouldStoreReference && type === TYPE.DICT) {
            value = Object.create(null);
            this.refs.push(value);
            this.readDict(value, depth);
            return value;
        }

        switch (type) {
            case TYPE.NULL:
                value = NULL;
                break;
            case TYPE.NONE:
                value = null;
                break;
            case TYPE.FALSE:
                value = false;
                break;
            case TYPE.TRUE:
                value = true;
                break;
            case TYPE.INT:
                value = this.readInt32();
                break;
            case TYPE.INT64:
                value = this.readInteger64();
                break;
            case TYPE.LONG:
                value = this.readLong();
                break;
            case TYPE.FLOAT:
                value = Number(this.decodeText(this.readBytes(this.readUint8())));
                break;
            case TYPE.BINARY_FLOAT:
                value = this.readFloat64();
                break;
            case TYPE.STRING:
                value = this.readByteString(this.readUint32());
                break;
            case TYPE.INTERNED:
            case TYPE.UNICODE:
            case TYPE.ASCII:
            case TYPE.ASCII_INTERNED:
                value = this.decodeText(this.readBytes(this.readUint32()));
                break;
            case TYPE.SHORT_ASCII:
            case TYPE.SHORT_ASCII_INTERNED:
                value = this.decodeText(this.readBytes(this.readUint8()));
                break;
            case TYPE.STRINGREF:
            case TYPE.REF:
                value = this.readReference();
                break;
            case TYPE.LIST:
            case TYPE.TUPLE:
            case TYPE.SET:
            case TYPE.FROZENSET:
                value = [];
                if (shouldStoreReference) this.refs[referenceIndex] = value;
                this.readSequence(value, this.readUint32(), depth);
                break;
            case TYPE.SMALL_TUPLE:
                value = [];
                if (shouldStoreReference) this.refs[referenceIndex] = value;
                this.readSequence(value, this.readUint8(), depth);
                break;
            case TYPE.DICT:
                value = Object.create(null);
                if (shouldStoreReference) this.refs[referenceIndex] = value;
                this.readDict(value, depth);
                break;
            case TYPE.STOPITER:
            case TYPE.ELLIPSIS:
            case TYPE.COMPLEX:
            case TYPE.BINARY_COMPLEX:
            case TYPE.CODE:
                throw new OperationError(`Python marshal type '${String.fromCharCode(type)}' is not representable as JSON`);
            default:
                throw new OperationError(`Unsupported Python marshal type 0x${type.toString(16).padStart(2, "0")}`);
        }

        if (shouldStoreReference) this.refs[referenceIndex] = value;
        if (typeof value === "number" && !Number.isFinite(value)) {
            throw new OperationError("Non-finite Python marshal numbers are not representable as JSON");
        }
        return value;
    }

    /**
     * @returns {number|Object}
     */
    readInteger64() {
        const bytes = this.readBytes(8);
        let value = 0n;
        for (let i = 7; i >= 0; i--) value = (value << 8n) | BigInt(bytes[i]);
        if (value >= (1n << 63n)) value -= 1n << 64n;
        return this.toJsonInteger(value);
    }

    /**
     * @returns {number|Object}
     */
    readLong() {
        const size = this.readInt32();
        const digitCount = Math.abs(size);
        if (digitCount > MAX_ITEMS) throw new OperationError("Python marshal integer has too many digits");

        let value = 0n;
        for (let i = 0; i < digitCount; i++) {
            const bytes = this.readBytes(2);
            const digit = BigInt(bytes[0] | (bytes[1] << 8));
            value |= digit << BigInt(i * 15);
        }
        return this.toJsonInteger(size < 0 ? -value : value);
    }

    /**
     * @param {bigint} value
     * @returns {number|Object}
     */
    toJsonInteger(value) {
        if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) return Number(value);
        return { _pythonMarshalType: "int", value: value.toString() };
    }

    /**
     * @param {number} length
     * @returns {Object}
     */
    readByteString(length) {
        return {
            _pythonMarshalType: "bytes",
            hex: Array.from(this.readBytes(length), byte => byte.toString(16).padStart(2, "0")).join(""),
        };
    }

    /**
     * @returns {Object|Array|string|number|boolean|null}
     */
    readReference() {
        const reference = this.readUint32();
        if (reference >= this.refs.length) throw new OperationError("Python marshal data contains an invalid reference");
        return this.refs[reference];
    }

    /**
     * @param {Array} value
     * @param {number} length
     * @param {number} depth
     */
    readSequence(value, length, depth) {
        if (length > MAX_ITEMS) throw new OperationError("Python marshal collection has too many items");
        for (let i = 0; i < length; i++) value.push(this.readValue(depth + 1));
    }

    /**
     * @param {Object} value
     * @param {number} depth
     */
    readDict(value, depth) {
        for (let i = 0; i < MAX_ITEMS; i++) {
            const key = this.readValue(depth + 1);
            if (key === NULL) return;
            if (typeof key !== "string") throw new OperationError("Python marshal dictionaries with non-string keys are not representable as JSON");
            value[key] = this.readValue(depth + 1);
        }
        throw new OperationError("Python marshal dictionary has too many items");
    }

}

/**
 * Serialises JSON-compatible values into a Python marshal byte stream.
 *
 * Python integers and byte strings that JSON cannot represent natively are
 * accepted through the tagged object forms produced by Reader.
 */
class Writer {

    /**
     * Initialises byte chunks that finish() concatenates in a single pass,
     * avoiding repeated allocation as nested values are serialised.
     */
    constructor() {
        this.parts = [];
    }

    /**
     * @returns {ArrayBuffer}
     */
    finish() {
        const length = this.parts.reduce((total, part) => total + part.length, 0);
        const result = new Uint8Array(length);
        let offset = 0;
        for (const part of this.parts) {
            result.set(part, offset);
            offset += part.length;
        }
        return result.buffer;
    }

    /**
     * @param {number} type
     */
    writeType(type) {
        this.parts.push(Uint8Array.of(type));
    }

    /**
     * @param {number} value
     */
    writeInt32(value) {
        const bytes = new Uint8Array(4);
        new DataView(bytes.buffer).setInt32(0, value, true);
        this.parts.push(bytes);
    }

    /**
     * @param {number} value
     */
    writeUint32(value) {
        const bytes = new Uint8Array(4);
        new DataView(bytes.buffer).setUint32(0, value, true);
        this.parts.push(bytes);
    }

    /**
     * @param {number} value
     */
    writeFloat64(value) {
        const bytes = new Uint8Array(8);
        new DataView(bytes.buffer).setFloat64(0, value, true);
        this.parts.push(bytes);
    }

    /**
     * @param {Object|Array|string|number|boolean|null} value
     * @param {number} depth
     */
    writeValue(value, depth) {
        if (depth > MAX_DEPTH) throw new OperationError("JSON input is nested too deeply");

        if (value === null) {
            this.writeType(TYPE.NONE);
        } else if (typeof value === "boolean") {
            this.writeType(value ? TYPE.TRUE : TYPE.FALSE);
        } else if (typeof value === "string") {
            this.writeText(value);
        } else if (typeof value === "number") {
            this.writeNumber(value);
        } else if (Array.isArray(value)) {
            if (value.length > MAX_ITEMS) throw new OperationError("JSON array has too many items");
            this.writeType(TYPE.LIST);
            this.writeUint32(value.length);
            for (const item of value) this.writeValue(item, depth + 1);
        } else if (typeof value === "object") {
            if (value._pythonMarshalType === "bytes") {
                this.writeBytes(value);
            } else if (value._pythonMarshalType === "int") {
                this.writeLong(value);
            } else {
                const keys = Object.keys(value);
                if (keys.length > MAX_ITEMS) throw new OperationError("JSON object has too many properties");
                this.writeType(TYPE.DICT);
                for (const key of keys) {
                    this.writeText(key);
                    this.writeValue(value[key], depth + 1);
                }
                this.writeType(TYPE.NULL);
            }
        } else {
            throw new OperationError(`Cannot encode JSON value of type '${typeof value}' as Python marshal`);
        }
    }

    /**
     * @param {string} value
     */
    writeText(value) {
        const bytes = textEncoder.encode(value);
        this.writeType(TYPE.UNICODE);
        this.writeUint32(bytes.length);
        this.parts.push(bytes);
    }

    /**
     * @param {number} value
     */
    writeNumber(value) {
        if (!Number.isFinite(value)) throw new OperationError("JSON numbers must be finite");
        if (Number.isSafeInteger(value)) {
            if (value >= -0x80000000 && value <= 0x7fffffff) {
                this.writeType(TYPE.INT);
                this.writeInt32(value);
            } else {
                this.writeBigInt(BigInt(value));
            }
        } else {
            this.writeType(TYPE.BINARY_FLOAT);
            this.writeFloat64(value);
        }
    }

    /**
     * @param {Object} value
     */
    writeBytes(value) {
        if (typeof value.hex !== "string" || !/^(?:[0-9a-f]{2})*$/i.test(value.hex)) {
            throw new OperationError("Python marshal bytes values require an even-length hexadecimal 'hex' string");
        }
        const bytes = new Uint8Array(value.hex.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(value.hex.slice(i * 2, i * 2 + 2), 16);
        this.writeType(TYPE.STRING);
        this.writeUint32(bytes.length);
        this.parts.push(bytes);
    }

    /**
     * @param {Object} value
     */
    writeLong(value) {
        if (typeof value.value !== "string" || !/^-?\d+$/.test(value.value)) {
            throw new OperationError("Python marshal integer values require a decimal string 'value'");
        }
        this.writeBigInt(BigInt(value.value));
    }

    /**
     * @param {bigint} value
     */
    writeBigInt(value) {
        let integer = value;
        const negative = integer < 0n;
        if (negative) integer = -integer;
        const digits = [];
        while (integer) {
            digits.push(Number(integer & 0x7fffn));
            integer >>= 15n;
        }
        this.writeType(TYPE.LONG);
        this.writeInt32(negative ? -digits.length : digits.length);
        for (const digit of digits) this.parts.push(Uint8Array.of(digit & 0xff, digit >> 8));
    }

}

export default PythonMarshal;
