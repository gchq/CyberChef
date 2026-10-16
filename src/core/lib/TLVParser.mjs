/**
 * Parser for Type-length-value data.
 *
 * @author gchq77703 []
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const defaults = {
    location: 0,
    bytesInLength: 1,
    basicEncodingRules: false
};

/**
 * TLVParser library
 */
export default class TLVParser {

    /**
     * TLVParser constructor
     *
     * @param {byteArray|Uint8Array} input
     * @param {Object} options
     */
    constructor(input, options) {
        this.input = input;
        Object.assign(this, defaults, options);
    }

    /**
     * @returns {number}
     */
    getLength() {
        let bytesInLength = this.bytesInLength;
        let bigEndian = false;

        if (this.basicEncodingRules) {
            const firstLengthByte = this.input[this.location];
            this.location++;

            if (firstLengthByte & 0x80) {
                bytesInLength = firstLengthByte & ~0x80;
                bigEndian = true;
            } else {
                return firstLengthByte & ~0x80;
            }
        }

        let length = 0;

        for (let i = 0; i < bytesInLength; i++) {
            if (bigEndian) {
                length = (length << 8) + this.input[this.location];
            } else {
                length += this.input[this.location] * Math.pow(Math.pow(2, 8), i);
            }
            this.location++;
        }

        return length;
    }

    /**
     * @param {number} length
     * @returns {number[]}
     */
    getValue(length) {
        const value = [];

        for (let i = 0; i < length; i++) {
            if (this.location > this.input.length) return value;
            value.push(this.input[this.location]);
            this.location++;
        }

        return value;
    }

    /**
     * @returns {boolean}
     */
    atEnd() {
        return this.input.length <= this.location;
    }
}
