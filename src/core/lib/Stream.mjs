/**
 * Stream class for parsing binary protocols.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */

/**
 * A Stream can be used to traverse a binary blob, interpreting sections of it
 * as various data types.
 */
export default class Stream {

    /**
     * Stream constructor.
     *
     * @param {Uint8Array} input
     */
    constructor(input) {
        this.bytes = input;
        this.position = 0;
    }

    /**
     * Get a number of bytes from the current position.
     *
     * @param {number} numBytes
     * @returns {Uint8Array}
     */
    getBytes(numBytes) {
        const newPosition = this.position + numBytes;
        const bytes = this.bytes.slice(this.position, newPosition);
        this.position = newPosition;
        return bytes;
    }

    /**
     * Interpret the following bytes as a string, stopping at the next null byte or
     * the supplied limit.
     *
     * @param {number} numBytes
     * @returns {string}
     */
    readString(numBytes) {
        let result = "";
        for (let i = this.position; i < this.position + numBytes; i++) {
            const currentByte = this.bytes[i];
            if (currentByte === 0) break;
            result += String.fromCharCode(currentByte);
        }
        this.position += numBytes;
        return result;
    }

    /**
     * Interpret the following bytes as an integer in big or little endian.
     *
     * @param {number} numBytes
     * @param {string} [endianness="be"]
     * @returns {number}
     */
    readInt(numBytes, endianness="be") {
        let val = 0;
        if (endianness === "be") {
            for (let i = this.position; i < this.position + numBytes; i++) {
                val = val << 8;
                val |= this.bytes[i];
            }
        } else {
            for (let i = this.position + numBytes - 1; i >= this.position; i--) {
                val = val << 8;
                val |= this.bytes[i];
            }
        }
        this.position += numBytes;
        return val;
    }

    /**
     * Consume the stream until we reach the specified byte or sequence of bytes.
     *
     * @param {number|List<number>} val
     */
    continueUntil(val) {
        if (typeof val === "number") {
            while (++this.position < this.bytes.length && this.bytes[this.position] !== val) {
                continue;
            }
            return;
        }

        // val is an array
        let found = false;
        while (!found && this.position < this.bytes.length) {
            while (++this.position < this.bytes.length && this.bytes[this.position] !== val[0]) {
                continue;
            }
            found = true;
            for (let i = 1; i < val.length; i++) {
                if (this.position + i > this.bytes.length || this.bytes[this.position + i] !== val[i])
                    found = false;
            }
        }
    }

    /**
     * Consume the next byte if it matches the supplied value.
     *
     * @param {number} val
     */
    consumeIf(val) {
        if (this.bytes[this.position] === val)
            this.position++;
    }

    /**
     * Move forwards through the stream by the specified number of bytes.
     *
     * @param {number} numBytes
     */
    moveForwardsBy(numBytes) {
        this.position += numBytes;
    }

    /**
     * Move to a specified position in the stream.
     *
     * @param {number} pos
     */
    moveTo(pos) {
        if (pos < 0 || pos > this.bytes.length - 1)
            throw new Error("Cannot move to position " + pos + " in stream. Out of bounds.");
        this.position = pos;
    }

    /**
     * Returns true if there are more bytes left in the stream.
     *
     * @returns {boolean}
     */
    hasMore() {
        return this.position < this.bytes.length;
    }

    /**
     * Returns a slice of the stream up to the current position.
     *
     * @returns {Uint8Array}
     */
    carve() {
        return this.bytes.slice(0, this.position);
    }

}
