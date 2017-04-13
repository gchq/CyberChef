import Utils from "./Utils.js";


/**
 * The data being operated on by each operation.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {byteArray|string|number} value - The value of the input data.
 * @param {number} type - The data type of value, see Dish enums.
 */
var Dish = function(value, type) {
    this.value = value || typeof value == "string" ? value : null;
    this.type  = type || Dish.BYTE_ARRAY;
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
 * Returns the data type enum for the given type string.
 *
 * @static
 * @param {string} typeStr - The name of the data type.
 * @returns {number} The data type enum value.
 */
Dish.typeEnum = function(typeStr) {
    switch (typeStr) {
        case "byteArray":
        case "Byte array":
            return Dish.BYTE_ARRAY;
        case "string":
        case "String":
            return Dish.STRING;
        case "number":
        case "Number":
            return Dish.NUMBER;
        case "html":
        case "HTML":
            return Dish.HTML;
        default:
            throw "Invalid data type string. No matching enum.";
    }
};


/**
 * Returns the data type string for the given type enum.
 *
 * @static
 * @param {string} typeEnum - The enum value of the data type.
 * @returns {number} The data type as a string.
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
        default:
            throw "Invalid data type enum. No matching type.";
    }
};


/**
 * Sets the data value and type and then validates them.
 *
 * @param {byteArray|string|number} value - The value of the input data.
 * @param {number} type - The data type of value, see Dish enums.
 */
Dish.prototype.set = function(value, type) {
    this.value = value;
    this.type  = type;

    if (!this.valid()) {
        const sample = Utils.truncate(JSON.stringify(this.value), 13);
        throw "Data is not a valid " + Dish.enumLookup(type) + ": " + sample;
    }
};


/**
 * Returns the value of the data in the type format specified.
 *
 * @param {number} type - The data type of value, see Dish enums.
 * @returns {byteArray|string|number} The value of the output data.
 */
Dish.prototype.get = function(type) {
    if (this.type !== type) {
        this.translate(type);
    }
    return this.value;
};


/**
 * Translates the data to the given type format.
 *
 * @param {number} toType - The data type of value, see Dish enums.
 */
Dish.prototype.translate = function(toType) {
    // Convert data to intermediate byteArray type
    switch (this.type) {
        case Dish.STRING:
            this.value = this.value ? Utils.strToByteArray(this.value) : [];
            this.type = Dish.BYTE_ARRAY;
            break;
        case Dish.NUMBER:
            this.value = typeof this.value == "number" ? Utils.strToByteArray(this.value.toString()) : [];
            this.type = Dish.BYTE_ARRAY;
            break;
        case Dish.HTML:
            this.value = this.value ? Utils.strToByteArray(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : [];
            this.type = Dish.BYTE_ARRAY;
            break;
        default:
            break;
    }

    // Convert from byteArray to toType
    switch (toType) {
        case Dish.STRING:
        case Dish.HTML:
            this.value = this.value ? Utils.byteArrayToUtf8(this.value) : "";
            this.type = Dish.STRING;
            break;
        case Dish.NUMBER:
            this.value = this.value ? parseFloat(Utils.byteArrayToUtf8(this.value)) : 0;
            this.type = Dish.NUMBER;
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
                if (typeof this.value[i] != "number" ||
                    this.value[i] < 0 ||
                    this.value[i] > 255) {
                    return false;
                }
            }
            return true;
        case Dish.STRING:
        case Dish.HTML:
            if (typeof this.value == "string") {
                return true;
            }
            return false;
        case Dish.NUMBER:
            if (typeof this.value == "number") {
                return true;
            }
            return false;
        default:
            return false;
    }
};

export default Dish;
