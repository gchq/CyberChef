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
        this.length = this.bytes.length;
        this.position = 0;
        this.bitPos = 0;
    }

    /**
     * Get a number of bytes from the current position.
     *
     * @param {number} numBytes
     * @returns {Uint8Array}
     */
    getBytes(numBytes) {
        if (this.position > this.length) return undefined;

        const newPosition = this.position + numBytes;
        const bytes = this.bytes.slice(this.position, newPosition);
        this.position = newPosition;
        this.bitPos = 0;
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
        if (this.position > this.length) return undefined;

        let result = "";
        for (let i = this.position; i < this.position + numBytes; i++) {
            const currentByte = this.bytes[i];
            if (currentByte === 0) break;
            result += String.fromCharCode(currentByte);
        }
        this.position += numBytes;
        this.bitPos = 0;
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
        if (this.position > this.length) return undefined;

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
        this.bitPos = 0;
        return val;
    }

    /**
     * Reads a number of bits from the buffer.
     *
     * @TODO Add endianness
     *
     * @param {number} numBits
     * @returns {number}
     */
    readBits(numBits) {
        if (this.position > this.length) return undefined;

        let bitBuf = 0,
            bitBufLen = 0;

        // Add remaining bits from current byte
        bitBuf = (this.bytes[this.position++] & bitMask(this.bitPos)) >>> this.bitPos;
        bitBufLen = 8 - this.bitPos;
        this.bitPos = 0;

        // Not enough bits yet
        while (bitBufLen < numBits) {
            bitBuf |= this.bytes[this.position++] << bitBufLen;
            bitBufLen += 8;
        }

        // Reverse back to numBits
        if (bitBufLen > numBits) {
            const excess = bitBufLen - numBits;
            bitBuf &= (1 << numBits) - 1;
            bitBufLen -= excess;
            this.position--;
            this.bitPos = 8 - excess;
        }

        return bitBuf;

        /**
         * Calculates the bit mask based on the current bit position.
         *
         * @param {number} bitPos
         * @returns {number} The bit mask
         */
        function bitMask(bitPos) {
            return 256 - (1 << bitPos);
        }
    }

    /**
     * Consume the stream until we reach the specified byte or sequence of bytes.
     *
     * @param {number|List<number>} val
     */
    continueUntil(val) {
        if (this.position > this.length) return;

        this.bitPos = 0;

        if (typeof val === "number") {
            while (++this.position < this.length && this.bytes[this.position] !== val) {
                continue;
            }
            return;
        }

        // val is an array


        /**
         * Build's the skip forward table from the value to be searched.
         *
         * @param val
         * @param len
         */
        function preprocess(val, len) {
            const skiptable = new Array();
            val.forEach(function(element, index) {
                skiptable[element] = len - index;
            });
            return skiptable;
        }

        const length = val.length;

        const initial = val[length-1];

        this.position = length;

        // Get the skip table.
        const skiptable = preprocess(val, length);
        let found = true;

        while (this.position < this.length) {

            // Until we hit the final element of val in the stream.
            while ((this.position < this.length) && (this.bytes[this.position++] !== initial));

            found = true;

            // Loop through the elements comparing them to val.
            for (let x = length-1; x != -1; x--) {
                if (this.bytes[(this.position-length) + x] !== val[x]) {
                    found = false;

                    // If element is not equal to val's element then jump forward by the correct amount.
                    this.position += skiptable[val[x]];
                    break;
                }
            }
            if (found) {
                this.position = (this.position - length);
                break;
            }
        }
    }


    /**
     * Consume bytes if it matches the supplied value.
     *
     * @param val
     */
    consumeWhile(val) {
        while ((this.position < this.length) && (this.bytes[this.position++] === val));
    }

    /**
     * Consume the next byte if it matches the supplied value.
     *
     * @param {number} val
     */
    consumeIf(val) {
        if (this.bytes[this.position] === val) {
            this.position++;
            this.bitPos = 0;
        }
    }

    /**
     * Move forwards through the stream by the specified number of bytes.
     *
     * @param {number} numBytes
     */
    moveForwardsBy(numBytes) {
        const pos = this.position + numBytes;
        if (pos < 0 || pos > this.length)
            throw new Error("Cannot move to position " + pos + " in stream. Out of bounds.");
        this.position = pos;
        this.bitPos = 0;
    }

    /**
     * Move backwards through the stream by the specified number of bytes.
     *
     * @param {number} numBytes
     */
    moveBackwardsBy(numBytes) {
        const pos = this.position - numBytes;
        if (pos < 0 || pos > this.length)
            throw new Error("Cannot move to position " + pos + " in stream. Out of bounds.");
        this.position = pos;
        this.bitPos = 0;
    }

    /**
     * Move backwards through the strem by the specified number of bits.
     *
     * @param {number} numBits
     */
    moveBackwardsByBits(numBits) {
        if (numBits <= this.bitPos) {
            this.bitPos -= numBits;
        } else {
            if (this.bitPos > 0) {
                numBits -= this.bitPos;
                this.bitPos = 0;
            }

            while (numBits > 0) {
                this.moveBackwardsBy(1);
                this.bitPos = 8;
                this.moveBackwardsByBits(numBits);
                numBits -= 8;
            }
        }
    }

    /**
     * Move to a specified position in the stream.
     *
     * @param {number} pos
     */
    moveTo(pos) {
        if (pos < 0 || pos > this.length)
            throw new Error("Cannot move to position " + pos + " in stream. Out of bounds.");
        this.position = pos;
        this.bitPos = 0;
    }

    /**
     * Returns true if there are more bytes left in the stream.
     *
     * @returns {boolean}
     */
    hasMore() {
        return this.position < this.length;
    }

    /**
     * Returns a slice of the stream up to the current position.
     *
     * @returns {Uint8Array}
     */
    carve() {
        if (this.bitPos > 0) this.position++;
        return this.bytes.slice(0, this.position);
    }

}
