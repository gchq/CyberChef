import Utils from "./Utils.js";
import BigNumber from "bignumber.js";

/**
 * The data being operated on by each operation.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {byteArray|string|number|ArrayBuffer|BigNumber} value - The value of the input data.
 * @param {number} type - The data type of value, see Dish enums.
 */
const Dish = function(value, type) {
    this.value = value || typeof value === "string" ? value : null;
    this.type = type || Dish.BYTE_ARRAY;
};


/**
 * Dish data type enum for byte arrays.
 * @readonly
 * @enum
 */
Dish.BYTE_ARRAY = 0;
/**
 * Dish data type enum for strings.
 * @readonly
 * @enum
 */
Dish.STRING = 1;
/**
 * Dish data type enum for numbers.
 * @readonly
 * @enum
 */
Dish.NUMBER = 2;
/**
 * Dish data type enum for HTML.
 * @readonly
 * @enum
 */
Dish.HTML = 3;
/**
 * Dish data type enum for ArrayBuffers.
 * @readonly
 * @enum
 */
Dish.ARRAY_BUFFER = 4;
/**
 * Dish data type enum for BigNumbers.
 * @readonly
 * @enum
 */
Dish.BIG_NUMBER = 5;


/**
 * Returns the data type enum for the given type string.
 *
 * @static
 * @param {string} typeStr - The name of the data type.
 * @returns {number} The data type enum value.
 */
Dish.typeEnum = function(typeStr) {
    switch (typeStr.toLowerCase()) {
        case "bytearray":
        case "byte array":
            return Dish.BYTE_ARRAY;
        case "string":
            return Dish.STRING;
        case "number":
            return Dish.NUMBER;
        case "html":
            return Dish.HTML;
        case "arraybuffer":
        case "array buffer":
            return Dish.ARRAY_BUFFER;
        case "bignumber":
        case "big number":
            return Dish.BIG_NUMBER;
        default:
            throw "Invalid data type string. No matching enum.";
    }
};


/**
 * Returns the data type string for the given type enum.
 *
 * @static
 * @param {number} typeEnum - The enum value of the data type.
 * @returns {string} The data type as a string.
 */
Dish.enumLookup = function(typeEnum) {
    switch (typeEnum) {
        case Dish.BYTE_ARRAY:
            return "byteArray";
        case Dish.STRING:
            return "string";
        case Dish.NUMBER:
            return "number";
        case Dish.HTML:
            return "html";
        case Dish.ARRAY_BUFFER:
            return "ArrayBuffer";
        case Dish.BIG_NUMBER:
            return "BigNumber";
        default:
            throw "Invalid data type enum. No matching type.";
    }
};


/**
 * Sets the data value and type and then validates them.
 *
 * @param {byteArray|string|number|ArrayBuffer|BigNumber} value - The value of the input data.
 * @param {number} type - The data type of value, see Dish enums.
 */
Dish.prototype.set = function(value, type) {
    log.debug("Dish type: " + Dish.enumLookup(type));
    this.value = value;
    this.type = type;

    if (!this.valid()) {
        const sample = Utils.truncate(JSON.stringify(this.value), 13);
        throw "Data is not a valid " + Dish.enumLookup(type) + ": " + sample;
    }
};


/**
 * Returns the value of the data in the type format specified.
 *
 * @param {number} type - The data type of value, see Dish enums.
 * @param {boolean} [notUTF8] - Do not treat strings as UTF8.
 * @returns {byteArray|string|number|ArrayBuffer|BigNumber} The value of the output data.
 */
Dish.prototype.get = function(type, notUTF8) {
    if (this.type !== type) {
        this.translate(type, notUTF8);
    }
    return this.value;
};


/**
 * Translates the data to the given type format.
 *
 * @param {number} toType - The data type of value, see Dish enums.
 * @param {boolean} [notUTF8] - Do not treat strings as UTF8.
 */
Dish.prototype.translate = function(toType, notUTF8) {
    log.debug(`Translating Dish from ${Dish.enumLookup(this.type)} to ${Dish.enumLookup(toType)}`);
    const byteArrayToStr = notUTF8 ? Utils.byteArrayToChars : Utils.byteArrayToUtf8;

    // Convert data to intermediate byteArray type
    switch (this.type) {
        case Dish.STRING:
            this.value = this.value ? Utils.strToByteArray(this.value) : [];
            break;
        case Dish.NUMBER:
            this.value = typeof this.value == "number" ? Utils.strToByteArray(this.value.toString()) : [];
            break;
        case Dish.HTML:
            this.value = this.value ? Utils.strToByteArray(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : [];
            break;
        case Dish.ARRAY_BUFFER:
            // Array.from() would be nicer here, but it's slightly slower
            this.value = Array.prototype.slice.call(new Uint8Array(this.value));
            break;
        case Dish.BIG_NUMBER:
            this.value = this.value instanceof BigNumber ? Utils.strToByteArray(this.value.toFixed()) : [];
            break;
        default:
            break;
    }

    this.type = Dish.BYTE_ARRAY;

    // Convert from byteArray to toType
    switch (toType) {
        case Dish.STRING:
        case Dish.HTML:
            this.value = this.value ? byteArrayToStr(this.value) : "";
            this.type = Dish.STRING;
            break;
        case Dish.NUMBER:
            this.value = this.value ? parseFloat(byteArrayToStr(this.value)) : 0;
            this.type = Dish.NUMBER;
            break;
        case Dish.ARRAY_BUFFER:
            this.value = new Uint8Array(this.value).buffer;
            this.type = Dish.ARRAY_BUFFER;
            break;
        case Dish.BIG_NUMBER:
            try {
                this.value = new BigNumber(byteArrayToStr(this.value));
            } catch (err) {
                this.value = new BigNumber(NaN);
            }
            this.type = Dish.BIG_NUMBER;
            break;
        default:
            break;
    }
};


/**
 * Validates that the value is the type that has been specified.
 * May have to disable parts of BYTE_ARRAY validation if it effects performance.
 *
 * @returns {boolean} Whether the data is valid or not.
*/
Dish.prototype.valid = function() {
    switch (this.type) {
        case Dish.BYTE_ARRAY:
            if (!(this.value instanceof Array)) {
                return false;
            }

            // Check that every value is a number between 0 - 255
            for (let i = 0; i < this.value.length; i++) {
                if (typeof this.value[i] !== "number" ||
                    this.value[i] < 0 ||
                    this.value[i] > 255) {
                    return false;
                }
            }
            return true;
        case Dish.STRING:
        case Dish.HTML:
            return typeof this.value === "string";
        case Dish.NUMBER:
            return typeof this.value === "number";
        case Dish.ARRAY_BUFFER:
            return this.value instanceof ArrayBuffer;
        case Dish.BIG_NUMBER:
            return this.value instanceof BigNumber;
        default:
            return false;
    }
};


/**
 * Determines how much space the Dish takes up.
 * Numbers in JavaScript are 64-bit floating point, however for the purposes of the Dish,
 * we measure how many bytes are taken up when the number is written as a string.
 *
 * @returns {number}
*/
Dish.prototype.size = function() {
    switch (this.type) {
        case Dish.BYTE_ARRAY:
        case Dish.STRING:
        case Dish.HTML:
            return this.value.length;
        case Dish.NUMBER:
        case Dish.BIG_NUMBER:
            return this.value.toString().length;
        case Dish.ARRAY_BUFFER:
            return this.value.byteLength;
        default:
            return -1;
    }
};


export default Dish;
