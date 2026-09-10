/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { parseBigInt } from "../lib/BigIntUtils.mjs";
import { toHex } from "../lib/Hex.mjs";
import { integerByteWidth } from "../lib/IntegerPacking.mjs";

/**
 * Pack fixed-width integers without losing large-integer precision.
 */
class PackIntegers extends Operation {
    /**
     * PackIntegers constructor.
     */
    constructor() {
        super();
        this.name = "Pack Integers";
        this.module = "Default";
        this.description = "Packs decimal or 0x-prefixed hexadecimal integers into fixed-width binary words. Negative decimal values use two's complement; positive values may use the full unsigned range. Values outside that range are rejected rather than truncated.<br><br>Size must be a multiple of 8 from 8 to 4096 bits. Custom separators are literal strings; surrounding whitespace on each number is ignored. An empty separator treats the input as one integer. Raw output preserves binary bytes. Packed data is limited to 64 MiB. Use Unpack Integers for the inverse operation.";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [
            {name: "Size in bits", type: "editableOptionShort", value: ["8", "16", "32", "64"], defaultIndex: 2},
            {name: "Separator", type: "binaryShortString", value: ","},
            {name: "Output format", type: "option", value: ["Raw", "Hex"]},
            {name: "Endianness", type: "option", value: ["Big endian", "Little endian"]}
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer|string}
     */
    run(input, args) {
        const [size, separator, format, endian] = args,
            width = integerByteWidth(size),
            tokens = input.trim() === "" ? [] : separator === "" ? [input] : input.split(separator);
        if (tokens.length * width > 64 * 1024 * 1024) {
            throw new OperationError("Packed output must not exceed 64 MiB.");
        }
        const bytes = new Uint8Array(tokens.length * width),
            modulus = 1n << BigInt(width * 8),
            minimum = -(modulus >> 1n);
        for (let index = 0; index < tokens.length; index++) {
            let value = parseBigInt(tokens[index], `Integer at position ${index + 1}`);
            if (value < minimum || value >= modulus) {
                throw new OperationError(`Integer at position ${index + 1} does not fit in ${width * 8} bits.`);
            }
            if (value < 0n) value += modulus;
            for (let offset = 0; offset < width; offset++) {
                const target = endian === "Little endian" ? offset : width - offset - 1;
                bytes[index * width + target] = Number(value & 255n);
                value >>= 8n;
            }
        }
        this.outputType = format === "Hex" ? "string" : "ArrayBuffer";
        this.presentType = this.outputType;
        return format === "Hex" ? toHex(bytes, " ") : bytes.buffer;
    }
}

export default PackIntegers;
