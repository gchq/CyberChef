/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { fromHex } from "../lib/Hex.mjs";
import { integerByteWidth } from "../lib/IntegerPacking.mjs";

/**
 * Unpack fixed-width binary words to exact decimal integers.
 */
class UnpackIntegers extends Operation {
    /**
     * UnpackIntegers constructor.
     */
    constructor() {
        super();
        this.name = "Unpack Integers";
        this.module = "Default";
        this.description = "Unpacks fixed-width binary words into decimal integers without loss of precision. Enable Signed to interpret two's-complement values. Size must be a multiple of 8 from 8 to 4096 bits. Input must contain complete words.<br><br>Hex input accepts hexadecimal byte pairs with optional whitespace. Raw input uses the bytes directly. The output separator is a literal string. Use Pack Integers for the inverse operation.";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {name: "Size in bits", type: "editableOptionShort", value: ["8", "16", "32", "64"], defaultIndex: 2},
            {name: "Signed", type: "boolean", value: false},
            {name: "Separator", type: "binaryShortString", value: ", "},
            {name: "Input format", type: "option", value: ["Raw", "Hex"]},
            {name: "Endianness", type: "option", value: ["Big endian", "Little endian"]}
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [size, signed, separator, format, endian] = args,
            width = integerByteWidth(size);
        let bytes = new Uint8Array(input);
        if (format === "Hex") {
            const hex = Utils.arrayBufferToStr(input, false).replace(/\s+/g, "");
            if (!/^(?:[0-9a-f]{2})*$/i.test(hex)) {
                throw new OperationError("Hex input must contain complete hexadecimal byte pairs separated only by whitespace.");
            }
            bytes = new Uint8Array(fromHex(hex));
        }
        if (bytes.length % width !== 0) {
            throw new OperationError(`Input length must be a multiple of ${width} bytes.`);
        }
        const output = [],
            modulus = 1n << BigInt(width * 8),
            signBit = modulus >> 1n;
        for (let start = 0; start < bytes.length; start += width) {
            let value = 0n;
            for (let offset = 0; offset < width; offset++) {
                const source = endian === "Little endian" ? width - offset - 1 : offset;
                value = (value << 8n) | BigInt(bytes[start + source]);
            }
            if (signed && value >= signBit) value -= modulus;
            output.push(value.toString());
        }
        return output.join(separator);
    }
}

export default UnpackIntegers;
