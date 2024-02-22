import Utils from "../Utils.mjs";
import protobuf from "protobufjs";

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
     * @param {byteArray|Uint8Array} data
     */
    constructor(data) {
        // Check we have a byteArray or Uint8Array
        if (data instanceof Array || data instanceof Uint8Array) {
            this.data = data;
        } else {
            throw new Error("Protobuf input must be a byteArray or Uint8Array");
        }

        // Set up masks
        this.TYPE = 0x07;
        this.NUMBER = 0x78;
        this.MSB = 0x80;
        this.VALUE = 0x7f;

        // Declare offset, length, and field type object
        this.offset = 0;
        this.LENGTH = data.length;
        this.fieldTypes = {};
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
     * Encode input JSON according to the given schema
     *
     * @param {Object} input
     * @param {Object []} args
     * @returns {Object}
     */
    static encode(input, args) {
        this.updateProtoRoot(args[0]);
        if (!this.mainMessageName) {
            throw new Error("Schema Error: Schema not defined");
        }
        const message = this.parsedProto.root.nested[this.mainMessageName];

        // Convert input into instance of message, and verify instance
        input = message.fromObject(input);
        const error = message.verify(input);
        if (error) {
            throw new Error("Input Error: " + error);
        }
        // Encode input
        const output = message.encode(input).finish();
        return new Uint8Array(output).buffer;
    }

    /**
     * Parse Protobuf data
     *
     * @param {byteArray} input
     * @returns {Object}
     */
    static decode(input, args) {
        this.updateProtoRoot(args[0]);
        this.showUnknownFields = args[1];
        this.showTypes = args[2];
        return this.mergeDecodes(input);
    }

    /**
     * Update the parsedProto, throw parsing errors
     *
     * @param {string} protoText
     */
    static updateProtoRoot(protoText) {
        try {
            this.parsedProto = protobuf.parse(protoText);
            if (this.parsedProto.package) {
                this.parsedProto.root = this.parsedProto.root.nested[this.parsedProto.package];
            }
            this.updateMainMessageName();
        } catch (error) {
            throw new Error("Schema " + error);
        }
    }

    /**
     * Set mainMessageName to the first instance of a message defined in the schema that is not a submessage
     *
     */
    static updateMainMessageName() {
        const messageNames = [];
        const fieldTypes = [];
        this.parsedProto.root.nestedArray.forEach(block => {
            if (block instanceof protobuf.Type) {
                messageNames.push(block.name);
                this.parsedProto.root.nested[block.name].fieldsArray.forEach(field => {
                    fieldTypes.push(field.type);
                });
            }
        });

        if (messageNames.length === 0) {
            this.mainMessageName = null;
        } else {
            // for (const name of messageNames) {
            //     if (!fieldTypes.includes(name)) {
            //         this.mainMessageName = name;
            //         break;
            //     }
            // }
            this.mainMessageName = messageNames[0];
        }
    }

    /**
     * Decode input using Protobufjs package and raw methods, compare, and merge results
     *
     * @param {byteArray} input
     * @returns {Object}
     */
    static mergeDecodes(input) {
        const pb = new Protobuf(input);
        let rawDecode = pb._parse();
        let message;

        if (this.showTypes) {
            rawDecode = this.showRawTypes(rawDecode, pb.fieldTypes);
            this.parsedProto.root = this.appendTypesToFieldNames(this.parsedProto.root);
        }

        try {
            message = this.parsedProto.root.nested[this.mainMessageName];
            const packageDecode = message.toObject(message.decode(input), {
                bytes: String,
                longs: Number,
                enums: String,
                defaults: true
            });
            const output = {};

            if (this.showUnknownFields) {
                output[message.name] = packageDecode;
                output["Unknown Fields"] = this.compareFields(rawDecode, message);
                return output;
            } else {
                return packageDecode;
            }

        } catch (error) {
            if (message) {
                throw new Error("Input " + error);
            } else {
                return rawDecode;
            }
        }
    }

    /**
     * Replace fieldnames with fieldname and type
     *
     * @param {Object} schemaRoot
     * @returns {Object}
     */
    static appendTypesToFieldNames(schemaRoot) {
        for (const block of schemaRoot.nestedArray) {
            if (block instanceof protobuf.Type) {
                for (const [fieldName, fieldData] of Object.entries(block.fields)) {
                    schemaRoot.nested[block.name].remove(block.fields[fieldName]);
                    schemaRoot.nested[block.name].add(new protobuf.Field(`${fieldName} (${fieldData.type})`, fieldData.id, fieldData.type, fieldData.rule));
                }
            }
        }
        return schemaRoot;
    }

    /**
     * Add field type to field name for fields in the raw decoded output
     *
     * @param {Object} rawDecode
     * @param {Object} fieldTypes
     * @returns {Object}
     */
    static showRawTypes(rawDecode, fieldTypes) {
        for (const [fieldNum, value] of Object.entries(rawDecode)) {
            const fieldType = fieldTypes[fieldNum];
            let outputFieldValue;
            let outputFieldType;

            // Submessages
            if (isNaN(fieldType)) {
                outputFieldType = 2;

                // Repeated submessages
                if (Array.isArray(value)) {
                    const fieldInstances = [];
                    for (const instance of Object.keys(value)) {
                        if (typeof(value[instance]) !== "string") {
                            fieldInstances.push(this.showRawTypes(value[instance], fieldType));
                        } else {
                            fieldInstances.push(value[instance]);
                        }
                    }
                    outputFieldValue = fieldInstances;

                // Single submessage
                } else {
                    outputFieldValue = this.showRawTypes(value, fieldType);
                }

            // Non-submessage field
            } else {
                outputFieldType = fieldType;
                outputFieldValue = value;
            }

            // Substitute fieldNum with field number and type
            rawDecode[`field #${fieldNum}: ${this.getTypeInfo(outputFieldType)}`] = outputFieldValue;
            delete rawDecode[fieldNum];
        }
        return rawDecode;
    }

    /**
     * Compare raw decode to package decode and return discrepancies
     *
     * @param rawDecodedMessage
     * @param schemaMessage
     * @returns {Object}
     */
    static compareFields(rawDecodedMessage, schemaMessage) {
        // Define message data using raw decode output and schema
        const schemaFieldProperties = {};
        const schemaFieldNames = Object.keys(schemaMessage.fields);
        schemaFieldNames.forEach(field => schemaFieldProperties[schemaMessage.fields[field].id] = field);

        // Loop over each field present in the raw decode output
        for (const fieldName in rawDecodedMessage) {
            let fieldId;
            if (isNaN(fieldName)) {
                fieldId = fieldName.match(/^field #(\d+)/)[1];
            } else {
                fieldId = fieldName;
            }

            // Check if this field is defined in the schema
            if (fieldId in schemaFieldProperties) {
                const schemaFieldName = schemaFieldProperties[fieldId];

                // Extract the current field data from the raw decode and schema
                const rawFieldData = rawDecodedMessage[fieldName];
                const schemaField = schemaMessage.fields[schemaFieldName];

                // Check for repeated fields
                if (Array.isArray(rawFieldData) && !schemaField.repeated) {
                    rawDecodedMessage[`(${schemaMessage.name}) ${schemaFieldName} is a repeated field`] = rawFieldData;
                }

                // Check for submessage fields
                if (schemaField.resolvedType instanceof protobuf.Type) {
                    const subMessageType = schemaMessage.fields[schemaFieldName].type;
                    const schemaSubMessage = this.parsedProto.root.nested[subMessageType];
                    const rawSubMessages = rawDecodedMessage[fieldName];
                    let rawDecodedSubMessage = {};

                    // Squash multiple submessage instances into one submessage
                    if (Array.isArray(rawSubMessages)) {
                        rawSubMessages.forEach(subMessageInstance => {
                            const instanceFields = Object.entries(subMessageInstance);
                            instanceFields.forEach(subField => {
                                rawDecodedSubMessage[subField[0]] = subField[1];
                            });
                        });
                    } else {
                        rawDecodedSubMessage = rawSubMessages;
                    }

                    // Treat submessage as own message and compare its fields
                    rawDecodedSubMessage = Protobuf.compareFields(rawDecodedSubMessage, schemaSubMessage);
                    if (Object.entries(rawDecodedSubMessage).length !== 0) {
                        rawDecodedMessage[`${schemaFieldName} (${subMessageType}) has missing fields`] = rawDecodedSubMessage;
                    }
                }
                delete rawDecodedMessage[fieldName];
            }
        }
        return rawDecodedMessage;
    }

    /**
     * Returns wiretype information for input wiretype number
     *
     * @param {number} wireType
     * @returns {string}
     */
    static getTypeInfo(wireType) {
        switch (wireType) {
            case 0:
                return "VarInt (e.g. int32, bool)";
            case 1:
                return "64-Bit (e.g. fixed64, double)";
            case 2:
                return "L-delim (e.g. string, message)";
            case 5:
                return "32-Bit (e.g. fixed32, float)";
        }
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

        if (typeof(this.fieldTypes[key]) !== "object") {
            this.fieldTypes[key] = type;
        }

        switch (type) {
            // varint
            case 0:
                return { "key": key, "value": this._varInt() };
            // fixed 64
            case 1:
                return { "key": key, "value": this._uint64() };
            // length delimited
            case 2:
                return { "key": key, "value": this._lenDelim(key) };
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
        } while ((this.data[this.offset++] & this.MSB) === this.MSB);
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
        // Read off a Uint64 with little-endian
        const lowerHalf = this.data[this.offset++] + (this.data[this.offset++] * 0x100) + (this.data[this.offset++] * 0x10000) + this.data[this.offset++] * 0x1000000;
        const upperHalf = this.data[this.offset++] + (this.data[this.offset++] * 0x100) + (this.data[this.offset++] * 0x10000) + this.data[this.offset++] * 0x1000000;
        return upperHalf * 0x100000000 + lowerHalf;
    }

    /**
     * Read off a length delimited field from the data
     *
     * @private
     * @returns {Object|string}
     */
    _lenDelim(fieldNum) {
        // Read off the field length
        const length = this._varInt();
        const fieldBytes = this.data.slice(this.offset, this.offset + length);
        let field;
        try {
            // Attempt to parse as a new Protobuf Object
            const pbObject = new Protobuf(fieldBytes);
            field = pbObject._parse();

            // Set field types object
            this.fieldTypes[fieldNum] = {...this.fieldTypes[fieldNum], ...pbObject.fieldTypes};

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
        const value = dataview.getUint32(0, true);
        this.offset += 4;
        return value;
    }
}

export default Protobuf;
