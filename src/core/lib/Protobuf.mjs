import Utils from "../Utils";

/**
 * Protobuf lib. Contains functions to decode protobuf serialised
 * data without a schema or .proto file.
 *
 * Provides utility functions to encode and decode variable length
 * integers (varint).
 *
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
class Protobuf {

    /**
     * Protobuf constructor
     *
     * @param {byteArray} data
     */
    constructor(data) {
        // Check we have a byteArray
        if (data instanceof Array) {
            this.data = data;
        } else {
            throw new Error("Protobuf input must be a byteArray");
        }

        // Set up masks
        this.TYPE = 0x07;
        this.NUMBER = 0x78;
        this.MSB = 0x80;
        this.VALUE = 0x7f;

        // Declare offset and length
        this.offset = 0;
        this.LENGTH = data.length;
    }

    // Public Functions

    /**
     * Encode a varint from a number
     *
     * @param {number} number
     * @returns {byteArray}
     */
    static varIntEncode(number) {
        const MSB = 0x80,
            VALUE = 0x7f,
            MSBALL = ~VALUE,
            INT = Math.pow(2, 31);
        const out = [];
        let offset = 0;

        while (number >= INT) {
            out[offset++] = (number & 0xff) | MSB;
            number /= 128;
        }
        while (number & MSBALL) {
            out[offset++] = (number & 0xff) | MSB;
            number >>>= 7;
        }
        out[offset] = number | 0;
        return out;
    }

    /**
     * Decode a varint from the byteArray
     *
     * @param {byteArray} input
     * @returns {number}
     */
    static varIntDecode(input) {
        const pb = new Protobuf(input);
        return pb._varInt();
    }

    /**
     * Parse Protobuf data
     *
     * @param {byteArray} input
     * @returns {Object}
     */
    static decode(input) {
        const pb = new Protobuf(input);
        return pb._parse();
    }

    // Private Class Functions

    /**
     * Main private parsing function
     *
     * @private
     * @returns {Object}
     */
    _parse() {
        let object = {};
        // Continue reading whilst we still have data
        while (this.offset < this.LENGTH) {
            const field = this._parseField();
            object = this._addField(field, object);
        }
        // Throw an error if we have gone beyond the end of the data
        if (this.offset > this.LENGTH) {
            throw new Error("Exhausted Buffer");
        }
        return object;
    }

    /**
     * Add a field read from the protobuf data into the Object. As
     * protobuf fields can appear multiple times, if the field already
     * exists we need to add the new field into an array of fields
     * for that key.
     *
     * @private
     * @param {Object} field
     * @param {Object} object
     * @returns {Object}
     */
    _addField(field, object) {
        // Get the field key/values
        const key = field.key;
        const value = field.value;
        object[key] = Object.prototype.hasOwnProperty.call(object, key) ?
            object[key] instanceof Array ?
                object[key].concat([value]) :
                [object[key], value] :
            value;
        return object;
    }

    /**
     * Parse a field and return the Object read from the record
     *
     * @private
     * @returns {Object}
     */
    _parseField() {
        // Get the field headers
        const header = this._fieldHeader();
        const type = header.type;
        const key = header.key;
        switch (type) {
            // varint
            case 0:
                return { "key": key, "value": this._varInt() };
            // fixed 64
            case 1:
                return { "key": key, "value": this._uint64() };
            // length delimited
            case 2:
                return { "key": key, "value": this._lenDelim() };
            // fixed 32
            case 5:
                return { "key": key, "value": this._uint32() };
            // unknown type
            default:
                throw new Error("Unknown type 0x" + type.toString(16));
        }
    }

    /**
     * Parse the field header and return the type and key
     *
     * @private
     * @returns {Object}
     */
    _fieldHeader() {
        // Make sure we call type then number to preserve offset
        return { "type": this._fieldType(), "key": this._fieldNumber() };
    }

    /**
     * Parse the field type from the field header. Type is stored in the
     * lower 3 bits of the tag byte. This does not move the offset on as
     * we need to read the field number from the tag byte too.
     *
     * @private
     * @returns {number}
     */
    _fieldType() {
        // Field type stored in lower 3 bits of tag byte
        return this.data[this.offset] & this.TYPE;
    }

    /**
     * Parse the field number (i.e. the key) from the field header. The
     * field number is stored in the upper 5 bits of the tag byte - but
     * is also varint encoded so the follow on bytes may need to be read
     * when field numbers are > 15.
     *
     * @private
     * @returns {number}
     */
    _fieldNumber() {
        let shift = -3;
        let fieldNumber = 0;
        do {
            fieldNumber += shift < 28 ?
                shift === -3 ?
                    (this.data[this.offset] & this.NUMBER) >> -shift :
                    (this.data[this.offset] & this.VALUE) << shift :
                (this.data[this.offset] & this.VALUE) * Math.pow(2, shift);
            shift += 7;
        } while ((this.data[this.offset++] & this.MSD) === this.MSB);
        return fieldNumber;
    }

    // Field Parsing Functions

    /**
     * Read off a varint from the data
     *
     * @private
     * @returns {number}
     */
    _varInt() {
        let value = 0;
        let shift = 0;
        // Keep reading while upper bit set
        do {
            value += shift < 28 ?
                (this.data[this.offset] & this.VALUE) << shift :
                (this.data[this.offset] & this.VALUE) * Math.pow(2, shift);
            shift += 7;
        } while ((this.data[this.offset++] & this.MSB) === this.MSB);
        return value;
    }

    /**
     * Read off a 64 bit unsigned integer from the data
     *
     * @private
     * @returns {number}
     */
    _uint64() {
        // Read off a Uint64
        let num = this.data[this.offset++] * 0x1000000 + (this.data[this.offset++] << 16) + (this.data[this.offset++] << 8) + this.data[this.offset++];
        num = num * 0x100000000 + this.data[this.offset++] * 0x1000000 + (this.data[this.offset++] << 16) + (this.data[this.offset++] << 8) + this.data[this.offset++];
        return num;
    }

    /**
     * Read off a length delimited field from the data
     *
     * @private
     * @returns {Object|string}
     */
    _lenDelim() {
        // Read off the field length
        const length = this._varInt();
        const fieldBytes = this.data.slice(this.offset, this.offset + length);
        let field;
        try {
            // Attempt to parse as a new Protobuf Object
            const pbObject = new Protobuf(fieldBytes);
            field = pbObject._parse();
        } catch (err) {
            // Otherwise treat as bytes
            field = Utils.byteArrayToChars(fieldBytes);
        }
        // Move the offset and return the field
        this.offset += length;
        return field;
    }

    /**
     * Read a 32 bit unsigned integer from the data
     *
     * @private
     * @returns {number}
     */
    _uint32() {
        // Use a dataview to read off the integer
        const dataview = new DataView(new Uint8Array(this.data.slice(this.offset, this.offset + 4)).buffer);
        const value = dataview.getUint32(0);
        this.offset += 4;
        return value;
    }
}

export default Protobuf;
