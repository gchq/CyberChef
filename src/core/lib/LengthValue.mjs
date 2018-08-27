/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const defaults = {
    location: 0,
    bytesInLength: 1,
    basicEncodingRules: false
};

/**
 * Length Value library
 */
export default class LengthValue {

    /**
     * LengthValue constructor
     */
    constructor(input, options) {
        this.input = input;
        Object.assign(this, defaults, options);
    }

    /**
     * @returns {Number}
     */
    getLength() {
        if (this.basicEncodingRules) {
            const bit = this.input[this.location];
            if (bit & 0x80) {
                this.bytesInLength = bit & ~0x80;
            } else {
                this.location++;
                return bit & ~0x80;
            }
        }

        let length = 0;

        for (let i = 0; i < this.bytesInLength; i++) {
            length += this.input[this.location] * Math.pow(Math.pow(2, 8), i);
            this.location++;
        }

        return length;
    }

    /**
     * @param {Number} length
     * @returns {Number[]}
     */
    getValue(length) {
        const value = [];

        for (let i = 0; i < length; i++) {
            value.push(this.input[this.location]);
            this.location++;
        }

        return value;
    }

    /**
     * @returns {Boolean}
     */
    atEnd() {
        return this.input.length <= this.location;
    }
}
